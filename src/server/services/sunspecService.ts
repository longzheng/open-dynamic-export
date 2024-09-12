import 'dotenv/config';
import { getConfig } from '../../helpers/config.js';
import {
    getSunSpecInvertersConnections,
    getSunSpecMeterConnection,
} from '../../sunspec/connections.js';
import {
    getInverterMetrics,
    getAggregatedInverterMetrics,
} from '../../sunspec/helpers/inverterMetrics.js';
import { getMeterMetrics } from '../../sunspec/helpers/meterMetrics.js';
import {
    getNameplateMetrics,
    getAggregatedNameplateMetrics,
} from '../../sunspec/helpers/nameplateMetrics.js';
import {
    getSettingsMetrics,
    getAggregatedSettingsMetrics,
} from '../../sunspec/helpers/settingsMetrics.js';
import {
    getStatusMetrics,
    getAggregatedStatusMetrics,
} from '../../sunspec/helpers/statusMetrics.js';

export async function getSunSpecData() {
    const config = getConfig();

    const invertersConnections = getSunSpecInvertersConnections(config);
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

    const meter = await (async () => {
        if (config.meter.type !== 'sunspec') {
            return null;
        }
        const meterConnection = getSunSpecMeterConnection(config.meter);
        const meterData = {
            common: await meterConnection.getCommonModel(),
            meter: await meterConnection.getMeterModel(),
        };

        meterConnection.client.destroy(() => {});

        return {
            metersData: meterData,
            meterMetrics: {
                meter: getMeterMetrics(meterData.meter),
            },
        };
    })();

    invertersConnections.map((inverter) => inverter.client.destroy(() => {}));

    return {
        invertersData: invertersData.map((inverterData) => ({
            inverter: inverterData.inverter,
            nameplate: inverterData.nameplate,
            settings: inverterData.settings,
            status: {
                ...inverterData.status,
                // remap bigint to string to avoid tsoa type error
                ActWh: inverterData.status.ActWh.toString(),
                ActVAh: inverterData.status.ActVAh.toString(),
                ActVArhQ1: inverterData.status.ActVArhQ1.toString(),
                ActVArhQ2: inverterData.status.ActVArhQ2.toString(),
                ActVArhQ3: inverterData.status.ActVArhQ3.toString(),
                ActVArhQ4: inverterData.status.ActVArhQ4.toString(),
            },
        })),
        inverterMetrics: invertersData.map((inverterData) => ({
            inverter: getInverterMetrics(inverterData.inverter),
            nameplate: getNameplateMetrics(inverterData.nameplate),
            settings: getSettingsMetrics(inverterData.settings),
            status: (() => {
                const statusMetrics = getStatusMetrics(inverterData.status);

                return {
                    ...statusMetrics,
                    // remap bigint to string to avoid tsoa type error
                    ActWh: statusMetrics.ActWh.toString(),
                    ActVAh: statusMetrics.ActVAh.toString(),
                    ActVArhQ1: statusMetrics.ActVArhQ1.toString(),
                    ActVArhQ2: statusMetrics.ActVArhQ2.toString(),
                    ActVArhQ3: statusMetrics.ActVArhQ3.toString(),
                    ActVArhQ4: statusMetrics.ActVArhQ4.toString(),
                };
            })(),
        })),
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
            status: (() => {
                const aggregatedStatusMetrics = getAggregatedStatusMetrics(
                    invertersData.map((inverterData) => inverterData.status),
                );

                return {
                    ...aggregatedStatusMetrics,
                    // remap bigint to string to avoid tsoa type error
                    ActWh: aggregatedStatusMetrics.ActWh.toString(),
                    ActVAh: aggregatedStatusMetrics.ActVAh.toString(),
                    ActVArhQ1: aggregatedStatusMetrics.ActVArhQ1.toString(),
                    ActVArhQ2: aggregatedStatusMetrics.ActVArhQ2.toString(),
                    ActVArhQ3: aggregatedStatusMetrics.ActVArhQ3.toString(),
                    ActVArhQ4: aggregatedStatusMetrics.ActVArhQ4.toString(),
                };
            })(),
        },
        ...meter,
    };
}
