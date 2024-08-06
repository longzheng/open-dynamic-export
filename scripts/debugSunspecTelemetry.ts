import 'dotenv/config';
import { getConfig } from '../src/config';
import { getTelemetryFromSunSpec } from '../src/coordinator.ts/telemetry/sunspec';
import { getSunSpecConnections } from '../src/sunspec/connections';

// This debugging script continously outputs telemetry data
// It reads SunSpec data, transforms and aggregates it into telemetry model
// It logs the telemetry data to the console
// It polls the inverters and smart meters every 100ms (after the previous poll)

const config = getConfig();

const { invertersConnections, metersConnections } =
    getSunSpecConnections(config);

async function poll() {
    try {
        const invertersData = await Promise.all(
            invertersConnections.map(async (inverter) => {
                return await inverter.getInverterModel();
            }),
        );

        const metersData = await Promise.all(
            metersConnections.map(async (meter) => {
                return await meter.getMeterModel();
            }),
        );

        console.log('telemetry');

        const telemetry = getTelemetryFromSunSpec({
            inverters: invertersData,
            meters: metersData,
        });

        console.dir(telemetry);
    } catch (error) {
        console.log('Failed to get interval telemetry', error);
    } finally {
        setTimeout(() => {
            void poll();
        }, 100);
    }
}

void poll();
