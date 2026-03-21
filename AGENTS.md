## Project Overview

This is a Node.js/TypeScript application for dynamic export control/solar curtailment of inverters. It implements CSIP-AUS/SEP2/IEEE 2030.5 standards for Australian energy distributors, provides fixed/zero export limitations, two-way tariffs, and negative feed-in export limitation.

The project is a full-stack application with:
- Express.js backend with TypeScript
- React frontend with Vite
- SunSpec Modbus integration for inverters/meters
- SEP2/IEEE 2030.5 client implementation
- InfluxDB metrics logging
- Real-time data coordination and control

## Development Commands

### Building and Running
- `npm run build` - Full production build (generates routes, compiles TypeScript, builds Vite frontend)
- `npm run build:debug` - Debug build with source maps
- `npm run dev` - Development server with hot reload
- `npm start` - Start production server

### Code Quality
- `npm run lint` - Run TypeScript compiler, ESLint, and generate config schema
- `npm test` - Run Vitest tests

### API and Routes
- `npm run routes:generate` - Generate TSOA routes and OpenAPI spec
- `npm run generate:config-json-schema` - Generate JSON schema for configuration

### Certificate Management (CSIP-AUS)
- `npm run cert:device-request` - Generate device certificate request
- `npm run cert:device-generate` - Generate device certificate
- `npm run cert:lfdi` - View device certificate LFDI

### Debugging
- `npm run debug:sunspec-discovery` - Debug SunSpec device discovery

### Documentation
- `npm run docs:dev` - Start VitePress docs development server
- `npm run docs:build` - Build documentation
- `npm run docs:preview` - Preview built documentation

## Architecture Overview

### Core Components

1. **Coordinator** (`src/coordinator/`) - Central orchestrator that manages data flow between components:
   - Coordinates inverter polling, site sampling, setpoint management
   - Handles SEP2 client integration and InfluxDB logging
   - Created via `createCoordinator()` factory function

2. **SEP2 Client** (`src/sep2/`) - IEEE 2030.5/CSIP-AUS protocol implementation:
   - Full SEP2 model definitions in `models/` directory
   - Client implementation with certificate-based PKI authentication
   - DER control scheduling, mirror usage point reporting
   - Extensive helper functions for protocol-specific operations

3. **Inverter Integration** (`src/inverter/`, `src/connections/`) - Multiple inverter support:
   - SunSpec Modbus TCP/RTU integration
   - SMA proprietary Modbus models
   - MQTT publishing capabilities
   - Abstracted through connection interfaces

4. **Meter Integration** (`src/meters/`) - Site power measurement:
   - SunSpec Modbus meters
   - Tesla Powerwall integration
   - Site sampling and polling infrastructure

5. **Setpoints** (`src/setpoints/`) - Export limitation strategies:
   - Fixed limits
   - CSIP-AUS dynamic limits
   - Negative feed-in (Amber API integration)
   - Two-way tariff implementations (Ausgrid, SAPN)
   - MQTT setpoint publishing

6. **Web UI** (`src/ui/`) - React dashboard:
   - TanStack Router for routing
   - HeroUI component library
   - Real-time data visualization with Chart.js
   - TypeScript API client generation

### Configuration

- Main config in `/config/config.json` (copy from `config.example.json`)
- Environment variables in `.env` (copy from `.env.example`)
- JSON schema validation for configuration
- Separate TypeScript configs for server (`tsconfig.server.json`) and UI (`tsconfig.ui.json`)

### Key Patterns

- **Factory Pattern**: Used extensively for creating inverter/meter connections
- **Event-Driven**: Coordinator uses event emitters for data flow coordination
- **Type-Safe APIs**: TSOA generates OpenAPI spec and routes from TypeScript decorators
- **Zod Validation**: Runtime type validation throughout the application
- **Modular Setpoints**: Plugin-style setpoint implementations

### Testing

- Vitest for unit testing with extensive mocking
- Mock data in `tests/` directory for SEP2, Amber API, Tesla Powerwall
- Test files co-located with source code (`.test.ts` suffix)

## Important Notes

- The project uses ESM modules (`"type": "module"` in package.json)
- Strict TypeScript configuration with `@tsconfig/strictest`
- Certificate-based authentication required for SEP2/CSIP-AUS integration
- InfluxDB integration for metrics storage and monitoring
- Production deployment via Docker with docker-compose configuration

## Development workflow

Before pushing changes, always lint, build, and test the project to ensure there are no errors.
1. Run `npm run lint` to check for lint errors.
2. Run `npm run build` to check for build errors.
3. Run `npm test` to execute unit tests.