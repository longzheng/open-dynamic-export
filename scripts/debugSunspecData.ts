import 'dotenv/config';
import { getConfig } from '../src/config';
import { getBrandByCommonModel } from '../src/sunspec/brand';
import { InverterSunSpecConnection } from '../src/sunspec/connection/inverter';
import { MeterSunSpecConnection } from '../src/sunspec/connection/meter';
import { getMeterMetrics } from '../src/sunspec/helpers/meterMetrics';
import { getInverterMetrics } from '../src/sunspec/helpers/inverterMetrics';

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

    console.log('inverters data');
    console.dir(invertersData);

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

    console.log('meters data');
    console.dir(metersData);

    console.log('inverter metrics');

    console.table(
        invertersData.map((inverterData) =>
            getInverterMetrics(inverterData.inverter),
        ),
    );

    console.log('meter metrics');

    console.table(
        metersData.map((meterData) => getMeterMetrics(meterData.meter)),
    );
})();
