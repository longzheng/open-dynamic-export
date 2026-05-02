## Project Overview

This repository is a full-stack Node.js/TypeScript application for dynamic export control and solar curtailment of inverters. It is designed around Australian DNSP requirements and supports:

- CSIP-AUS / SEP2 / IEEE 2030.5 dynamic export control
- Fixed and zero-export limits
- Two-way tariff export limitation
- Negative feed-in export limitation via Amber
- Site-level monitoring, coordinated control, and optional telemetry publishing/logging

The app is currently built as:

- Express 5 backend with TypeScript and TSOA-generated APIs
- React 18 frontend bundled with Vite and served through `vite-express`
- SunSpec Modbus TCP/RTU, SMA Core1, MQTT, and Tesla Powerwall 2 integrations
- SEP2 client implementation with certificate-based authentication
- Optional InfluxDB metrics logging and MQTT publishing of active limits

## Current Tooling

- Package manager: `pnpm`
- Runtime module system: ESM (`"type": "module"`)
- Node target in CI: Node 24
- Validation/schema: `valibot` plus generated `config.schema.json`
- Lint/format: `oxlint` and `oxfmt`
- Tests: `vitest`

## Development Commands

### Setup and Run

- `pnpm install` - Install dependencies
- `pnpm run dev` - Start the app in development mode via `tsx src/app.ts`
- `pnpm run build` - Generate OpenAPI/routes, compile the server, and build the UI
- `pnpm run build:debug` - Generate OpenAPI/routes and compile the debug server build
- `pnpm start` - Start the production server from `dist/app.js`

### Quality

- `pnpm run lint` - Generate routes, run `oxlint`, run `oxfmt --check`, and regenerate `config.schema.json`
- `pnpm run format` - Format the repo with `oxfmt`
- `pnpm test` - Run Vitest

### Generated Artifacts

- `pnpm run routes:generate` - Generate `src/tsoa/routes.ts`, `src/tsoa/swagger.json`, and `src/ui/gen/api.d.ts`
- `pnpm run generate:config-json-schema` - Generate `config.schema.json`
- `pnpm run generate:amber-api` - Regenerate the Amber OpenAPI types in `src/setpoints/negativeFeedIn/amber/api.d.ts`

### Certificates and Debugging

- `pnpm run cert:device-request` - Generate a device key and CSR for SEP2/CSIP-AUS
- `pnpm run cert:device-generate` - Generate a device certificate from the manufacturer certificate
- `pnpm run cert:lfdi` - Inspect the certificate LFDI
- `pnpm run debug:sunspec-discovery` - Debug SunSpec discovery against a device

### Documentation

- `pnpm run docs:dev` - Start the VitePress docs site locally
- `pnpm run docs:build` - Build the VitePress docs
- `pnpm run docs:preview` - Preview the built docs

## Architecture Overview

### Application Entry

- `src/app.ts` wires Express middleware, ReDoc at `/api/docs`, TSOA routes, and the React app through `vite-express`

### Coordinator

- `src/coordinator/` is the central orchestration layer
- `createCoordinator()` composes inverter polling, site sampling, setpoints, the inverter controller, InfluxDB writes, and teardown
- `src/server/services/coordinatorService.ts` exposes coordinator state and start/stop controls to the API/UI

### Control and Setpoints

- `src/setpoints/` contains the supported control sources:
- Fixed limits
- CSIP-AUS setpoints
- MQTT setpoints
- Amber negative feed-in setpoints
- Two-way tariff setpoints for `ausgridEA029` and `sapnRELE2W`
- `src/coordinator/helpers/inverterController.ts` merges those inputs into an active control limit and applies final inverter configuration
- `battery.chargeBufferWatts` is handled in the inverter controller as an additional export-limit floor for battery charging, not as a standalone setpoint module
- `src/coordinator/helpers/publish.ts` can publish the active control limit to MQTT

### Device Integrations

- `src/connections/` contains shared connection implementations
- `src/inverter/` supports SunSpec, SMA Core1, and MQTT inverter data/control paths
- `src/meters/` supports SunSpec, SMA Core1, MQTT, and Tesla Powerwall 2 site sampling

### SEP2 / CSIP-AUS

- `src/sep2/` contains the IEEE 2030.5 / SEP2 models and helpers
- The CSIP-AUS implementation supports discovery, in-band registration, DER status/capability/settings reporting, control scheduling, default control fallback, and mirror usage point reporting

### Server and UI

- API controllers live in `src/server/controllers/` and currently expose `coordinator`, `data`, `sunspec`, and `csipAus` endpoints
- The frontend lives in `src/ui/` and uses TanStack Router, TanStack Query, HeroUI, React Intl, and Chart.js
- Main UI routes are `index`, `readings`, and `limits`
- The frontend API types are generated from the TSOA OpenAPI spec into `src/ui/gen/api.d.ts`

## Configuration

- Environment variables live in `.env` and should be copied from `.env.example`
- Main runtime config lives at `config/config.json`, usually copied from `config/config.example.json`
- `CONFIG_DIR` controls where runtime config and certificate files are loaded from
- Required environment variables are validated in `src/helpers/env.ts`
- Optional InfluxDB environment variables enable metrics logging when present
- Example deployment/config variants also exist under `config/`

Key config areas defined in `src/helpers/config.ts`:

- `setpoints`
- `inverters`
- `inverterControl`
- `meter`
- `publish`
- `battery`

## Generated Files and CI Expectations

- Do not hand-edit generated files unless the workflow specifically requires it
- Important generated outputs include:
- `src/tsoa/routes.ts`
- `src/tsoa/swagger.json`
- `src/ui/gen/api.d.ts`
- `config.schema.json`
- CI in `.github/workflows/lint-test.yml` installs with `pnpm`, copies `.env.example` to `.env`, runs route generation, lint, build, checks for uncommitted generated changes, and then runs tests
- Docs are deployed by `.github/workflows/docs-deployment.yaml`
- Docker images are published by `.github/workflows/publish-docker.yml` on version tags

## Testing

- Vitest is used for unit tests
- Test files are mostly co-located with source as `*.test.ts`
- Additional SEP2 fixtures live under `tests/sep2/`

## Development Workflow

Before pushing changes, run the same core checks expected by CI:

1. `pnpm run lint`
2. `pnpm run build`
3. `pnpm test`
