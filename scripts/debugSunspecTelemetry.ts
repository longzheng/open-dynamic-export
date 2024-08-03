import 'dotenv/config';
import { getConfig } from '../src/config';
import { getBrandByCommonModel } from '../src/sunspec/brand';
import { InverterSunSpecConnection } from '../src/sunspec/connection/inverter';
import { MeterSunSpecConnection } from '../src/sunspec/connection/meter';
import { getTelemetryFromSunSpec } from '../src/coordinator.ts/telemetry';

const config = getConfig();

(() => {
    const invertersConnections = config.sunSpec.inverters.map(
        ({ ip, port, unitId }) =>
            new InverterSunSpecConnection({ ip, port, unitId }),
    );

    const metersConnections = config.sunSpec.meters.map(
        ({ ip, port, unitId }) =>
            new MeterSunSpecConnection({ ip, port, unitId }),
    );

    async function poll() {
        try {
            const invertersData = await Promise.all(
                invertersConnections.map(async (inverter) => {
                    const common = await inverter.getCommonModel();

                    const brand = getBrandByCommonModel(common);

                    return await inverter.getInverterModel(brand);
                }),
            );

            const metersData = await Promise.all(
                metersConnections.map(async (meter) => {
                    const common = await meter.getCommonModel();

                    const brand = getBrandByCommonModel(common);

                    return await meter.getMeterModel(brand);
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
})();
