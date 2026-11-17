# Deployment status and setup

The deployment foundation was provisioned on 2026-11-17:

- Dedicated billing-enabled GCP project: `fpa-proxy-zizico2` (`233219936967`).
- Artifact Registry: `europe-southwest1-docker.pkg.dev/fpa-proxy-zizico2/fpa`.
- Separate build/deploy/runtime identities and repository-scoped GitHub OIDC.
- HCP organization: `prociv-proxy`; isolated `fpa-bootstrap`, `fpa-staging`,
  and `fpa-production` workspaces using local execution. A separate organization
  could not be created because the account's free organization limit was reached.
- Vercel: `fpa-app` (`prj_5Lt1VE6CCUT4LILR8T7RmrP7MjT2`) in Bernardo's projects
  (`team_Em7GNLb8UiXwORrcERbfy9rh`), using Node 24 and Bun 1.4.4.
- GitHub repository variables and CI credentials are configured; staging and
  production deployments require an environment review on `main`.

Backend and application releases run through this repository's dispatch workflows.
Consult their latest runs for deployment status; foundation creation alone does
not mean the hosted app is live.

## Production release, 2026-11-17

- App: <https://fpa-app-five.vercel.app/>.
- Native gRPC gateway: <https://fpa-gateway-production-vf6f7gpcya-no.a.run.app>.
- Native gRPC adapter: <https://fpa-adapter-production-vf6f7gpcya-no.a.run.app>.
- [Backend CI](https://github.com/Zizico2/fpa-infra/actions/runs/44110114152):
  passed image builds, real-source container checks, reviewed-plan apply and hosted
  adapter/gateway/cache smoke tests.
- [App CI](https://github.com/Zizico2/fpa-infra/actions/runs/44113328409): passed
  the prebuilt production release and desktop/mobile browser checks.
- App revision: `74b9e58e8269207f65e31ebc167871a14a473490`;
  release infrastructure revision: `79e0e886f34d87096a84182c9ed603c0f87f5231`.

Additional checks confirmed results and standings for PO01, PO01A, PO02 and PO03,
multiple PO03 zones, and 2025/26 history through the hosted gateway. The public app
domain returned HTTP 200. Initial Cloud Run and Vercel error-log scans were clear;
no external Vercel log drains are configured. These are release-time checks, not
continuous monitoring. Staging workspaces exist but staging is not deployed.

For another installation, use a dedicated billing-enabled GCP project. Apply `providers/cloud-run/bootstrap`
with this repository's numeric GitHub identity and the intended owner identity.
Configure staging/production HCP workspaces, repository variables and secrets as
described in README. Preview/Production FPA_GRPC_URL must point to the matching
HTTPS native gRPC gateway. Do not point them at Prociv or IPMA.

The workflows build immutable image/artifact releases and retain the existing
reviewed-plan approval pattern. First create the backend, then configure the app's
gateway origin, review its build, and deploy. No source data is fabricated when
services are unavailable. Hosting is deliberately separate from source publication.
