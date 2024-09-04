import 'dotenv/config';
import { getConfig } from '../src/helpers/config';
import { getMeterMetrics } from '../src/sunspec/helpers/meterMetrics';
import {
    getAggregatedInverterMetrics,
    getInverterMetrics,
} from '../src/sunspec/helpers/inverterMetrics';
import { logger } from '../src/helpers/logger';
import {
    getAggregatedNameplateMetrics,
    getNameplateMetrics,
} from '../src/sunspec/helpers/nameplateMetrics';
import {
    getAggregatedStatusMetrics,
    getStatusMetrics,
} from '../src/sunspec/helpers/statusMetrics';
import {
    getAggregatedSettingsMetrics,
    getSettingsMetrics,
} from '../src/sunspec/helpers/settingsMetrics';
import {
    getSunSpecInvertersConnections,
    getSunSpecMeterConnection,
} from '../src/sunspec/connections';

// This debugging script dumps all the SunSpec model data
// It polls the inverters and smart meters once
// It logs all the SunSpec models to the console

const config = getConfig();

void (async () => {
    const invertersConnections = getSunSpecInvertersConnections(config);

    const meterConnection = getSunSpecMeterConnection(config);

    const invertersData = await Promise.all(
        invertersConnections.map(async (inverter) => {
            return {
                common: await inverter.getCommonModel(),
                inverter: await inverter.getInverterModel(),
                nameplate: await inverter.getNameplateModel(),
                settings: await inverter.getSettingsModel(),
                status: await inverter.getStatusModel(),
                controls: await inverter.getControlsModel(),
            };
        }),
    );

    const meterData = {
        common: await meterConnection.getCommonModel(),
        meter: await meterConnection.getMeterModel(),
    };

    logger.info({
        invertersData,
        metersData: meterData,
        inverterMetrics: invertersData.map((inverterData) => ({
            inverter: getInverterMetrics(inverterData.inverter),
            nameplate: getNameplateMetrics(inverterData.nameplate),
            settings: getSettingsMetrics(inverterData.settings),
            status: getStatusMetrics(inverterData.status),
        })),
        meterMetrics: {
            meter: getMeterMetrics(meterData.meter),
        },
        aggregatedMetrics: {
            inveter: getAggregatedInverterMetrics(
                invertersData.map((inverterData) => inverterData.inverter),
            ),
            nameplate: getAggregatedNameplateMetrics(
                invertersData.map((inverterData) => inverterData.nameplate),
            ),
            settings: getAggregatedSettingsMetrics(
                invertersData.map((inverterData) => inverterData.settings),
            ),
            status: getAggregatedStatusMetrics(
                invertersData.map((inverterData) => inverterData.status),
            ),
        },
    });

    process.exit();
})();
