import 'dotenv/config';
import { getConfig } from '../src/config';
import { getBrandByCommonModel } from '../src/sunspec/brand';
import { InverterSunSpecConnection } from '../src/sunspec/connection/inverter';
import { MeterSunSpecConnection } from '../src/sunspec/connection/meter';
import { getMeterMetrics } from '../src/sunspec/helpers/meterMetrics';
import { getInverterMetrics } from '../src/sunspec/helpers/inverterMetrics';
import { getTelemetryFromSunSpec } from '../src/coordinator.ts/telemetry';

const config = getConfig();

void (async () => {
    const invertersConnections = config.sunSpec.inverters.map(
        ({ ip, port, unitId }) =>
            new InverterSunSpecConnection({ ip, port, unitId }),
    );

    const metersConnections = config.sunSpec.meters.map(
        ({ ip, port, unitId }) =>
            new MeterSunSpecConnection({ ip, port, unitId }),
    );

    console.log('inverters data');

    const invertersData = await Promise.all(
        invertersConnections.map(async (inverter) => {
            const common = await inverter.getCommonModel();

            const brand = getBrandByCommonModel(common);

            return {
                common,
                inverter: await inverter.getInverterModel(brand),
                nameplate: await inverter.getNameplateModel(brand),
                settings: await inverter.getSettingsModel(brand),
                status: await inverter.getStatusModel(brand),
                controls: await inverter.getControlsModel(brand),
            };
        }),
    );

    console.dir(invertersData);

    console.log('meters data');

    const metersData = await Promise.all(
        metersConnections.map(async (meter) => {
            const common = await meter.getCommonModel();

            const brand = getBrandByCommonModel(common);

            return {
                common,
                meter: await meter.getMeterModel(brand),
            };
        }),
    );

    console.dir(metersData);

    console.log('meter metrics');

    console.dir(getMeterMetrics(metersData[0]!.meter));

    console.log('inverter metrics');

    console.dir(getInverterMetrics(invertersData[0]!.inverter));

    console.log('telemetry');

    const telemetry = getTelemetryFromSunSpec({
        inverters: invertersData.map(({ inverter }) => inverter),
        meters: metersData.map(({ meter }) => meter),
    });

    console.dir(telemetry);
})();
