import 'dotenv/config';
import { getConfig } from '../src/config';
import { InverterSunSpecConnection } from '../src/sunspec/connection/inverter';
import { MeterSunSpecConnection } from '../src/sunspec/connection/meter';
import { getMeterMetrics } from '../src/sunspec/helpers/meterMetrics';
import { getInverterMetrics } from '../src/sunspec/helpers/inverterMetrics';
import { logger } from '../src/logger';

// This debugging script dumps all the SunSpec model data
// It polls the inverters and smart meters once
// It logs all the SunSpec models to the console

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
            return {
                common: await inverter.getCachedCommonModel(),
                inverter: await inverter.getInverterModel(),
                nameplate: await inverter.getNameplateModel(),
                settings: await inverter.getSettingsModel(),
                status: await inverter.getStatusModel(),
                controls: await inverter.getControlsModel(),
            };
        }),
    );

    logger.info(invertersData, 'inverters data');

    const metersData = await Promise.all(
        metersConnections.map(async (meter) => {
            return {
                common: await meter.getCachedCommonModel(),
                meter: await meter.getMeterModel(),
            };
        }),
    );

    logger.info(metersData, 'meters data');

    logger.info(
        invertersData.map((inverterData) =>
            getInverterMetrics(inverterData.inverter),
        ),
        'inverter metrics',
    );

    logger.info(
        metersData.map((meterData) => getMeterMetrics(meterData.meter)),
        'meter metrics',
    );
})();
