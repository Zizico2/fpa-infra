import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

export const services = ["fpa-proxy", "fpa-gateway"] as const;
export const protoProjects = ["fpa-proto"] as const;
export const serviceConfig = {
  "fpa-proxy": { proto: "fpa-proto", image: "adapter" },
  "fpa-gateway": { proto: "fpa-proto", image: "gateway" },
} as const;
export const projects = [
  ...services,
  ...protoProjects,
  "fpa-openapi",
  "fpa-app",
] as const;
export type Project = (typeof projects)[number];
export type Releases = Record<
  Project,
  { repository: string; revision: string }
>;

export function validateReleases(value: unknown): Releases {
  assert(value && typeof value === "object", "Invalid releases manifest");
  const data = value as Releases;
  assert.deepEqual(Object.keys(data).sort(), [...projects].sort());
  for (const name of projects) {
    assert.equal(
      data[name]?.repository,
      `https://github.com/Zizico2/${name}.git`,
    );
    assert.match(
      data[name]?.revision,
      /^[a-f0-9]{40}$/,
      `${name}: use a full commit SHA`,
    );
    assert(
      !/^0{40}$/.test(data[name].revision),
      `${name}: unresolved revision`,
    );
  }
  return data;
}

export function releases(): Releases {
  return validateReleases(JSON.parse(readFileSync("releases.json", "utf8")));
}

export function checkProtoPins(root: string, manifest: Releases): void {
  for (const name of services) {
    const proto = serviceConfig[name].proto;
    const cargo = readFileSync(`${root}/${name}/Cargo.toml`, "utf8");
    const dependency = cargo
      .split("\n")
      .find((line) => line.startsWith(`${proto} = `));
    assert(
      dependency?.includes(`git = "${manifest[proto].repository}"`) &&
        dependency.includes(`rev = "${manifest[proto].revision}"`) &&
        !dependency.includes("path ="),
      `${name}: ${proto} pin differs`,
    );
    assert(
      !/\[patch(?:\.|\])|\[replace\]/.test(cargo),
      `${name}: API override`,
    );
  }
  const adapter = readFileSync(`${root}/fpa-proxy/Cargo.toml`, "utf8");
  const upstream = manifest["fpa-openapi"];
  for (const name of ["fpa-ws-client", "fpa-portal-client"]) {
    const dependency = adapter
      .split("\n")
      .find((line) => line.startsWith(`${name} = `));
    assert(
      dependency?.includes(`git = "${upstream.repository}"`) &&
        dependency.includes(`rev = "${upstream.revision}"`),
      `${name} OpenAPI pin differs`,
    );
  }
  assert.equal(
    readFileSync(`${root}/fpa-proto/proto/fpa/v1/results.proto`, "utf8"),
    readFileSync(`${root}/fpa-app/proto/fpa/v1/results.proto`, "utf8"),
    "App schema differs from the pinned protobuf contract",
  );
}
