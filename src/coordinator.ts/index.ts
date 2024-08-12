import 'dotenv/config';
import { defaultPollPushRates, SEP2Client } from '../sep2/client';
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
import { logger as pinoLogger } from '../logger';
import { TimeHelper } from '../sep2/helpers/time';
import { EndDeviceListHelper } from '../sep2/helpers/endDeviceList';
import { DerListHelper } from '../sep2/helpers/derList';
import { generateDerCapabilityResponse } from '../sep2/models/derCapability';
import { getDerCapabilityResponseFromSunSpecArray } from './derCapability';
import { postDerCapability } from '../sep2/helpers/derCapability';

const logger = pinoLogger.child({ module: 'coordinator' });

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

const timeResource: TimeHelper = new TimeHelper();
const endDeviceListResource: EndDeviceListHelper = new EndDeviceListHelper();
const derListResource = new DerListHelper();

const telemetryCache = new TelemetryCache();

function main() {
    endDeviceListResource.on('data', (endDeviceList) => {
        logger.info(endDeviceList, 'Received SEP2 end device list');

        // as a direct client, we expect only one end device that matches the LFDI of our certificate
        const endDevice = endDeviceList.endDevices.find(
            (endDevice) => endDevice.lFDI === sep2Client.lfdi,
        );

        if (!endDevice) {
            throw new Error('End device not found');
        }

        if (endDevice.enabled !== true) {
            throw new Error('End device is not enabled');
        }

        if (endDevice.derListLink) {
            derListResource.init({
                client: sep2Client,
                href: endDevice.derListLink.href,
                defaultPollRateSeconds: defaultPollPushRates.endDeviceListPoll,
            });
        }
    });

    derListResource.on('data', (derList) => {
        void (async () => {
            logger.info(derList, 'Received SEP2 end device DER list');

            if (derList.ders.length !== 1) {
                throw new Error(
                    `DERS list length is not 1, actual length ${derList.ders.length}`,
                );
            }

            const der = derList.ders.at(0)!;

            const inverterDerData = await Promise.all(
                invertersConnections.map(async (inverter) => {
                    return {
                        nameplate: await inverter.getNameplateModel(),
                        settings: await inverter.getSettingsModel(),
                    };
                }),
            );

            // https://sunspec.org/wp-content/uploads/2019/08/CSIPImplementationGuidev2.103-15-2018.pdf
            // For DERCapability and DERSettings, the Aggregator posts these resources at device start-up and on any changes.
            // For DERStatus, the Aggregator posts at the rate specified in DERList:pollRate.

            const derCapability = getDerCapabilityResponseFromSunSpecArray(
                inverterDerData.map((data) => data.nameplate),
            );

            await postDerCapability({
                der,
                derCapability,
                client: sep2Client,
            });

            // TODO post DERSettings and DERStatus
        })();
    });

    logger.info('Discovering SEP2');

    sep2Client.discover().on('data', (deviceCapability) => {
        logger.info(deviceCapability, 'Received SEP2 device capability');

        timeResource.init({
            client: sep2Client,
            href: deviceCapability.timeLink.href,
            defaultPollRateSeconds: defaultPollPushRates.deviceCapabilityPoll,
        });

        endDeviceListResource.init({
            client: sep2Client,
            href: deviceCapability.endDeviceListLink.href,
        });
    });

    logger.info('Starting SunSpec control loop');

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
