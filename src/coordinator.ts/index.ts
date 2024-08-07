import 'dotenv/config';
import { defaultIntervalSeconds, SEP2Client } from '../sep2/client';
import { getConfig, getConfigSep2CertKey } from '../config';
import { getSunSpecConnections } from '../sunspec/connections';
import { callEveryMinutesInterval } from '../cron';
import { TelemetryCache } from './telemetry/cache';
import {
    calculateDynamicExportConfig,
    generateControlsModelWriteFromDynamicExportConfig,
} from './dynamicExport';
import { generateCsipAusDerMonitoring } from './telemetry/sep2';
import { SunSpecDataEventEmitter } from './sunspecDataEventEmitter';

const config = getConfig();
const { sep2Cert, sep2Key } = getConfigSep2CertKey(config);

const { invertersConnections, metersConnections } =
    getSunSpecConnections(config);

const sunSpecDataEventEmitter = new SunSpecDataEventEmitter({
    invertersConnections,
    metersConnections,
});

const sep2Client = new SEP2Client({
    sep2Config: config.sep2,
    cert: sep2Cert,
    key: sep2Key,
});

const telemetryCache = new TelemetryCache();

async function main() {
    console.log('Discovering SEP2');

    await sep2Client.discovery().then(() => {
        // poll at default interval
        setInterval(() => {
            void sep2Client.discovery();
        }, defaultIntervalSeconds.DeviceCapability * 1000);
    });

    console.log('Starting SunSpec control loop');

    sunSpecDataEventEmitter.on(
        'data',
        ({ invertersData, telemetry, currentAveragePowerRatio }) => {
            void (async () => {
                // save telemetry to cache for SEP2 telemetry
                telemetryCache.addToCache(telemetry);

                const dynamicExportConfig = calculateDynamicExportConfig({
                    activeDerControlBase: null, // TODO get active DER control base
                    telemetry,
                    currentAveragePowerRatio,
                });

                // TODO: set dynamic export value
                await Promise.all(
                    invertersConnections.map(async (inverter, index) => {
                        const inverterData = invertersData[index];

                        if (!inverterData) {
                            throw new Error('Inverter data not found');
                        }

                        const writeControlsModel =
                            generateControlsModelWriteFromDynamicExportConfig({
                                config: dynamicExportConfig,
                                controlsModel: inverterData.controls,
                            });

                        await inverter.writeControlsModel(writeControlsModel);
                    }),
                );
            })();
        },
    );

    // send SEP2 telemetry every 5 minutes on the dot
    callEveryMinutesInterval(() => {
        // TODO: send telemetry
        const telemetryList = telemetryCache.getCacheAndClear();
        const csipAusDerMonitoring =
            generateCsipAusDerMonitoring(telemetryList);
    }, 5);
}

void main();
