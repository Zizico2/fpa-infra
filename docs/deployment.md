# Deployment status and setup

This repository prepares FPA releases; no FPA cloud project, HCP workspace,
Cloud Run service, Vercel project or public application has been provisioned.
Existing IPMA/Prociv resources and credentials are not reused implicitly.

Use a dedicated billing-enabled GCP project. Apply `providers/cloud-run/bootstrap`
with this repository's numeric GitHub identity and the intended owner identity.
Configure staging/production HCP workspaces, repository variables and secrets as
described in README. Preview/Production FPA_GRPC_URL must point to the matching
HTTPS native gRPC gateway. Do not point them at Prociv or IPMA.

The workflows build immutable image/artifact releases and retain the existing
reviewed-plan approval pattern. First create the backend, then configure the app's
gateway origin, review its build, and deploy. No source data is fabricated when
services are unavailable. Hosting is deliberately separate from source publication.
