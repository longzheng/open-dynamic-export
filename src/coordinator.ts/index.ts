import 'dotenv/config';
import { defaultIntervalSeconds, SEP2Client } from '../sep2/client';
import { getConfig, getConfigSep2CertKey } from '../config';
import { getSunSpecConnections } from '../sunspec/connections';
import { callEveryMinutesInterval } from '../cron';
import { getSunSpecTelemetry } from './telemetry/sunspec';
import { TelemetryCache } from './telemetry/cache';
import { getAveragePowerRatio } from '../sunspec/helpers/controls';
import { calculateDynamicExportValues } from './dynamicExport';
import { generateCsipAusDerMonitoring } from './telemetry/sep2';

const config = getConfig();
const { sep2Cert, sep2Key } = getConfigSep2CertKey(config);

const { invertersConnections, metersConnections } =
    getSunSpecConnections(config);

const sep2Client = new SEP2Client({
    sep2Config: config.sep2,
    cert: sep2Cert,
    key: sep2Key,
});

const telemetryCache = new TelemetryCache();

const dynamicExportLimitWatts = 1500;

async function main() {
    console.log('Discovering SEP2');
    await sep2Client.discovery().then(() => {
        // poll at default interval
        setInterval(() => {
            void sep2Client.discovery();
        }, defaultIntervalSeconds.DeviceCapability * 1000);
    });

    console.log('Starting SunSpec control loop');
    void sunSpecLoop();

    // send SEP2 telemetry every 5 minutes on the dot
    callEveryMinutesInterval(() => {
        // TODO: send telemetry
        const telemetryList = telemetryCache.getCacheAndClear();
        const csipAusDerMonitoring =
            generateCsipAusDerMonitoring(telemetryList);
    }, 5);
}

async function sunSpecLoop() {
    try {
        // get necessary inverter data
        const invertersData = await Promise.all(
            invertersConnections.map(async (inverter) => {
                return {
                    inverter: await inverter.getInverterModel(),
                    controls: await inverter.getControlsModel(),
                };
            }),
        );

        // get necessary meter data
        const metersData = await Promise.all(
            metersConnections.map(async (meter) => {
                return {
                    meter: await meter.getMeterModel(),
                };
            }),
        );

        // calculate telemetry data
        const telemetry = getSunSpecTelemetry({
            inverters: invertersData.map(({ inverter }) => inverter),
            meters: metersData.map(({ meter }) => meter),
        });

        // calculate current average inverter power ratio
        const currentPowerRatio = getAveragePowerRatio(
            invertersData.map(({ controls }) => controls),
        );

        // save telemetry to cache for SEP2 telemetry
        telemetryCache.addToCache(telemetry);

        // calculate dynamic export values
        const {
            siteWatts,
            solarWatts,
            targetSolarWatts,
            targetSolarPowerRatio,
        } = calculateDynamicExportValues({
            exportLimitWatts: dynamicExportLimitWatts,
            telemetry,
            currentPowerRatio,
        });

        // TODO: set dynamic export value
        // invertersConnections.map(async (inverter) => {
        //     await inverter.writeControlsModel();
        // });
    } catch (error) {
        console.log('Failed to calculate dynamic export', error);
    } finally {
        setTimeout(
            () => {
                void sunSpecLoop();
            },
            // CSIP-AUS requires average readings to be sampled at least every 5 seconds (see SA Power Networks – Dynamic Exports Utility Interconnection Handbook)
            // we execute this loop every 1 second to meet sampling requirements and meeting dynamic export requirements
            1000,
        );
    }
}

void main();
