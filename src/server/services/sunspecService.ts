import 'dotenv/config';
import { getConfig } from '../../helpers/config.js';
import { InverterSunSpecConnection } from '../../connections/sunspec/connection/inverter.js';
import { MeterSunSpecConnection } from '../../connections/sunspec/connection/meter.js';
import { getInverterMetrics } from '../../connections/sunspec/helpers/inverterMetrics.js';
import { getMeterMetrics } from '../../connections/sunspec/helpers/meterMetrics.js';
import { getNameplateMetrics } from '../../connections/sunspec/helpers/nameplateMetrics.js';
import { getSettingsMetrics } from '../../connections/sunspec/helpers/settingsMetrics.js';
import { getStatusMetrics } from '../../connections/sunspec/helpers/statusMetrics.js';

export async function getSunSpecData() {
    const config = getConfig();

    const invertersConnections = config.inverters
        .filter((inverter) => inverter.type === 'sunspec')
        .map((inverter) => new InverterSunSpecConnection(inverter));

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
        const meterConnection = new MeterSunSpecConnection(config.meter);
        const meterData = {
            common: await meterConnection.getCommonModel(),
            meter: await meterConnection.getMeterModel(),
        };

        return {
            metersData: meterData,
            meterMetrics: {
                meter: getMeterMetrics(meterData.meter),
            },
        };
    })();

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
        ...meter,
    };
}
