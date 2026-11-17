# fpa-infra

Portable OCI packaging, Compose, Cloud Run Terraform and Vercel release workflows
for Sete, mirroring prociv-infra/ipma-infra. `releases.json` pins exact public Git
revisions for fpa-openapi, fpa-proto, fpa-proxy, fpa-gateway and fpa-app. Source fetches
validate shared protobuf/client pins and the app's vendored schema.

Local services: adapter 50201 → FPA HTTP sources, gateway 50202 → adapter. The Next
app runs separately on 3200 with FPA_GRPC_URL=http://127.0.0.1:50202. No historical
database is required; historical seasons are queried from the federation.

```sh
rtk npm ci --ignore-scripts
rtk just verify
rtk just terraform-check
rtk just sources
rtk just images
rtk just up
rtk just smoke
rtk just down
```

The pinned Nix flake provides build/deployment tooling. Docker must be running.
Containers are non-root, read-only, use Tini/SIGTERM and map PORT to h2c. Cloud Run
uses Madrid, minimum zero/maximum two instances, native HTTP/2 and immutable image
digests. Moka is in-process; no database or external cache is provisioned.

Deployment setup: select a dedicated GCP project and HCP organization; run
`npm run hcp:setup`; apply bootstrap with immutable GitHub owner/repository IDs;
configure GCP_PROJECT_ID, GCP_REGION, TF_CLOUD_ORGANIZATION,
GCP_WORKLOAD_IDENTITY_PROVIDER, GCP_BUILD_SERVICE_ACCOUNT and
GCP_DEPLOY_SERVICE_ACCOUNT. Store TF_API_TOKEN privately with state read/write
and lock access to both environment workspaces. Run `npm run github:setup` for
reviewer gates. Dispatch Deploy Cloud Run to build/test images and review the exact
saved Terraform plan before apply. No infrastructure is provisioned by verification.

For Vercel, create/link fpa-app, configure server-only FPA_GRPC_URL independently
in Preview and Production, use Node 24/Bun 1.4.4, and set VERCEL_ORG_ID,
VERCEL_PROJECT_ID and private VERCEL_TOKEN in this infra repo. The Vercel workflow
builds the pinned source once, saves the artifact/hash for review, then publishes
that same prebuilt artifact after the chosen environment approval. Automatic
production deploys are disabled. The first Vercel deployment must be Production.
Protected preview smoke tests accept a privately configured bypass secret.

See [deployment status](docs/deployment.md). Project publication does not create
cloud resources, choose billing, or assert that the hosted app is live.
