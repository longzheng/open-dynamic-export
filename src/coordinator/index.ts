import 'dotenv/config';
import { SEP2Client } from '../sep2/client';
import { getConfig, getConfigSep2CertKey } from '../config';
import { getSunSpecConnections } from '../sunspec/connections';
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
import { MirrorUsagePointListHelper } from '../sep2/helpers/mirrorUsagePointList';

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

const timeHelper: TimeHelper = new TimeHelper({
    client: sep2Client,
});
const endDeviceListHelper: EndDeviceListHelper = new EndDeviceListHelper({
    client: sep2Client,
});
const derListHelper = new DerListHelper({
    client: sep2Client,
});
const derHelper = new DerHelper({
    client: sep2Client,
    invertersConnections,
});
const mirrorUsagePointListHelper = new MirrorUsagePointListHelper({
    client: sep2Client,
});

function main() {
    endDeviceListHelper.on('data', (endDeviceList) => {
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
            derListHelper.updateHref({
                href: endDevice.derListLink.href,
            });
        }
    });

    derListHelper.on('data', (derList) => {
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

        timeHelper.updateHref({
            href: deviceCapability.timeLink.href,
        });

        endDeviceListHelper.updateHref({
            href: deviceCapability.endDeviceListLink.href,
        });

        mirrorUsagePointListHelper.updateHref({
            href: deviceCapability.mirrorUsagePointListLink.href,
        });
    });

    logger.info('Starting SunSpec control loop');

    sunSpecDataEventEmitter.on(
        'data',
        ({ invertersData, monitoringSample, currentAveragePowerRatio }) => {
            void (async () => {
                derHelper.onInverterData(invertersData);
                mirrorUsagePointListHelper.addSample(monitoringSample);

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

                        if (config.sunSpec.control) {
                            await inverter.writeControlsModel(
                                writeControlsModel,
                            );
                        }
                    }),
                );
            })();
        },
    );
}

void main();
