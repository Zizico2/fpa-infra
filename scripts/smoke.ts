import assert from "node:assert/strict";
import { client } from "./grpc.ts";
const adapter = client(process.argv[2] ?? "http://127.0.0.1:50201");
const gateway = client(process.argv[3] ?? "http://127.0.0.1:50202");
try {
  await Promise.all([adapter.ready(), gateway.ready()]);
  await adapter.call("Ping");
  await gateway.call("Ping");
  const direct = await adapter.call("GetPhase", {
    competitionId: "10016",
    phaseId: "27903",
  });
  const first = await gateway.call("GetPhase", {
    competitionId: "10016",
    phaseId: "27903",
  });
  const second = await gateway.call("GetPhase", {
    competitionId: "10016",
    phaseId: "27903",
  });
  assert.deepEqual(first, second, "Gateway did not reuse a current snapshot");
  for (const value of [direct, first]) {
    assert(value.fetchedAt, "Missing retrieval timestamp");
    const rows = (value.matches ?? []) as Array<Record<string, unknown>>;
    assert.equal(
      new Set(rows.map((r) => r.id)).size,
      rows.length,
      "Duplicate stable match IDs",
    );
    console.log(`${rows.length} matches`);
  }
  console.log("Adapter, gateway, source mapping and cache reuse verified");
} finally {
  adapter.close();
  gateway.close();
}
