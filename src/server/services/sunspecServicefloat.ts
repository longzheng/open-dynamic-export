import 'dotenv/config';
import { getConfig } from '../../helpers/config.js';
import { InverterSunSpecfloatConnection } from '../../connections/sunspecfloat/connection/inverter.js';
import { MeterSunSpecfloatConnection } from '../../connections/sunspecfloat/connection/meter.js';
import { getInverterMetrics } from '../../connections/sunspecfloat/helpers/inverterMetrics.js';
import { getMeterMetrics } from '../../connections/sunspecfloat/helpers/meterMetrics.js';
import { getNameplateMetrics } from '../../connections/sunspecfloat/helpers/nameplateMetrics.js';
import { getSettingsMetrics } from '../../connections/sunspecfloat/helpers/settingsMetrics.js';
import { getStatusMetrics } from '../../connections/sunspecfloat/helpers/statusMetrics.js';

export async function getSunSpecfloatData() {
    const config = getConfig();

    const invertersConnections = config.inverters
        .filter((inverter) => inverter.type === 'sunspecfloat')
        .map((inverter) => new InverterSunSpecfloatConnection(inverter));

    const invertersData = await Promise.all(
        invertersConnections.map(async (inverter) => {
            return {
                common: await inverter.getCommonModel(),
                inverter: await inverter.getInverterModel(),
                nameplate: await inverter.getNameplateModel(),
                settings: await inverter.getSettingsModel(),
                status: await inverter.getStatusModel(),
                controls: await inverter.getControlsModel(),
                mppt: await inverter.getMpptModel(),
            };
        }),
    );

    const meter = await (async () => {
        if (config.meter.type !== 'sunspecfloat') {
            return null;
        }
        const meterConnection = new MeterSunSpecfloatConnection(config.meter);
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
            mppt: inverterData.mppt,
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
