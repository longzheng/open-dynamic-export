import 'dotenv/config';
import { defaultPollPushRates, SEP2Client } from '../sep2/client';
import { getConfig, getConfigSep2CertKey } from '../config';
import { getSunSpecConnections } from '../sunspec/connections';
import { MonitoringHelper } from './monitoring/helper';
import {
    calculateDynamicExportConfig,
    generateControlsModelWriteFromDynamicExportConfig,
} from './dynamicExport';
import { SunSpecDataEventEmitter } from './sunspecDataEventEmitter';
import { logger as pinoLogger } from '../logger';
import { TimeHelper } from '../sep2/helpers/time';
import { EndDeviceListHelper } from '../sep2/helpers/endDeviceList';
import { DerListHelper } from '../sep2/helpers/derList';
import { DerHelper } from '../sep2/helpers/der';

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
const derHelper = new DerHelper({
    client: sep2Client,
    invertersConnections,
});
const monitoringHelper = new MonitoringHelper();

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
        logger.info(derList, 'Received SEP2 end device DER list');

        if (derList.ders.length !== 1) {
            throw new Error(
                `DERS list length is not 1, actual length ${derList.ders.length}`,
            );
        }

        const der = derList.ders.at(0)!;

        derHelper.configureDer({
            der,
            pollRate: derList.pollRate,
        });
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
        ({ invertersData, monitoringSample, currentAveragePowerRatio }) => {
            void (async () => {
                derHelper.onInverterData(invertersData);
                monitoringHelper.addSample(monitoringSample);

                const dynamicExportConfig = calculateDynamicExportConfig({
                    activeDerControlBase: null, // TODO get active DER control base
                    monitoringSample,
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
}

void main();
