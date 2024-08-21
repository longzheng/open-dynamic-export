import 'dotenv/config';
import { SEP2Client } from '../sep2/client';
import { getConfig, getConfigSep2CertKey } from '../helpers/config';
import { getSunSpecConnections } from '../sunspec/connections';
import {
    calculateDynamicExportConfig,
    generateControlsModelWriteFromDynamicExportConfig,
} from './helpers/dynamicExport';
import { SunSpecDataHelper } from './helpers/sunspecData';
import { logger as pinoLogger } from '../helpers/logger';
import { TimeHelper } from '../sep2/helpers/time';
import { EndDeviceListHelper } from '../sep2/helpers/endDeviceList';
import { DerListHelper } from '../sep2/helpers/derList';
import { DerHelper } from '../sep2/helpers/der';
import { MirrorUsagePointListHelper } from '../sep2/helpers/mirrorUsagePointList';
import { FunctionSetAssignmentsListHelper } from '../sep2/helpers/functionSetAssignmentsList';
import { DerControlsHelper } from '../sep2/helpers/derControls';
import { ControlSchedulerHelper } from '../sep2/helpers/controlScheduler';

const logger = pinoLogger.child({ module: 'coordinator' });

const config = getConfig();
const { sep2Cert, sep2Key } = getConfigSep2CertKey(config);

const { invertersConnections, metersConnections } =
    getSunSpecConnections(config);

const sunSpecDataEventEmitter = new SunSpecDataHelper({
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
const functionSetAssignmentsListHelper = new FunctionSetAssignmentsListHelper({
    client: sep2Client,
});
const mirrorUsagePointListHelper = new MirrorUsagePointListHelper({
    client: sep2Client,
});

const exportLimitControlScheduler = new ControlSchedulerHelper({
    client: sep2Client,
    controlType: 'opModExpLimW',
}).on('changed', (data) => {
    // TODO immediately apply to inverter

    switch (data.type) {
        case 'schedule': {
            data.onStart();
            break;
        }
        case 'fallback':
            break;
    }
});

const derControlsHelper = new DerControlsHelper({
    client: sep2Client,
}).on('data', (data) => {
    logger.info(data, 'DER controls data changed');

    exportLimitControlScheduler.updateControlsData(data);
});

function main() {
    endDeviceListHelper.on('data', (endDeviceList) => {
        logger.info({ endDeviceList }, 'Received SEP2 end device list');

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

        if (endDevice.functionSetAssignmentsListLink) {
            functionSetAssignmentsListHelper.updateHref({
                href: endDevice.functionSetAssignmentsListLink.href,
            });
        }
    });

    derListHelper.on('data', (derList) => {
        logger.info({ derList }, 'Received SEP2 end device DER list');

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

    functionSetAssignmentsListHelper.on(
        'data',
        (functionSetAssignmentsList) => {
            logger.info(
                { functionSetAssignmentsList },
                'Received SEP2 function set assignments list',
            );

            derControlsHelper.updateFsaData(functionSetAssignmentsList);
        },
    );

    logger.info('Discovering SEP2');

    sep2Client.discover().on('data', (deviceCapability) => {
        logger.info({ deviceCapability }, 'Received SEP2 device capability');

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
        ({ invertersData, monitoringSample }) => {
            void (async () => {
                derHelper.onInverterData(invertersData);
                mirrorUsagePointListHelper.addSample(monitoringSample);

                const dynamicExportConfig = calculateDynamicExportConfig({
                    activeDerControlBase: null, // TODO get active DER control base
                    // exportControl: exportLimitControlScheduler.getActiveScheduleDerControlBaseValue()
                    inverterControlsData: invertersData.map(
                        ({ controls }) => controls,
                    ),
                    monitoringSample,
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
