import 'dotenv/config';
import { SEP2Client } from '../sep2/client';
import { getConfig, getConfigSep2CertKey } from '../helpers/config';
import { getSunSpecConnections } from '../sunspec/connections';
import { SunSpecDataHelper } from './helpers/sunspecData';
import { logger as pinoLogger } from '../helpers/logger';
import { TimeHelper } from '../sep2/helpers/time';
import { EndDeviceListHelper } from '../sep2/helpers/endDeviceList';
import { DerListHelper } from '../sep2/helpers/derList';
import { DerHelper } from '../sep2/helpers/der';
import { MirrorUsagePointListHelper } from '../sep2/helpers/mirrorUsagePointList';
import { FunctionSetAssignmentsListHelper } from '../sep2/helpers/functionSetAssignmentsList';
import { DerControlsHelper } from '../sep2/helpers/derControls';
import { InverterController } from './helpers/inverterController';
import { RampRateHelper } from './helpers/rampRate';
import { influxDbWriteApi } from '../helpers/influxdb';
import { Point } from '@influxdata/influxdb-client';

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

const rampRateHelper = new RampRateHelper();

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
    rampRateHelper,
});

const functionSetAssignmentsListHelper = new FunctionSetAssignmentsListHelper({
    client: sep2Client,
});

const mirrorUsagePointListHelper = new MirrorUsagePointListHelper({
    client: sep2Client,
});

const inverterController = new InverterController({
    client: sep2Client,
    invertersConnections,
    applyControl: config.sunSpec.control,
    rampRateHelper,
});

const derControlsHelper = new DerControlsHelper({
    client: sep2Client,
}).on('data', (data) => {
    logger.debug(data, 'DER controls data changed');

    inverterController.updateSep2ControlsData(data);

    rampRateHelper.setRampRate(
        data.fallbackControl.type === 'default'
            ? (data.fallbackControl.data.defaultControl.setGradW ?? null)
            : null,
    );
});

function main() {
    endDeviceListHelper.on('data', (endDeviceList) => {
        logger.debug({ endDeviceList }, 'Received SEP2 end device list');

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
        logger.debug({ derList }, 'Received SEP2 end device DER list');

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
            logger.debug(
                { functionSetAssignmentsList },
                'Received SEP2 function set assignments list',
            );

            derControlsHelper.updateFsaData(functionSetAssignmentsList);
        },
    );

    logger.info('Discovering SEP2');

    sep2Client.discover().on('data', (deviceCapability) => {
        logger.debug({ deviceCapability }, 'Received SEP2 device capability');

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

    sunSpecDataEventEmitter.on(
        'data',
        ({ invertersData, monitoringSample }) => {
            logger.trace(
                { invertersData, monitoringSample },
                'Received SunSpec data',
            );

            influxDbWriteApi.writePoints(
                [
                    new Point('monitoringSample')
                        .tag('type', 'der')
                        .floatField(
                            'reactivePower',
                            monitoringSample.der.reactivePower,
                        )
                        .floatField(
                            'frequency',
                            monitoringSample.der.frequency,
                        ),
                    new Point('monitoringSample')
                        .tag('type', 'der')
                        .tag('phase', 'A')
                        .floatField(
                            'realPower',
                            monitoringSample.der.realPower.phaseA,
                        )
                        .floatField(
                            'voltage',
                            monitoringSample.der.voltage.phaseA,
                        ),
                    monitoringSample.der.realPower.phaseB
                        ? new Point('monitoringSample')
                              .tag('type', 'der')
                              .tag('phase', 'B')
                              .floatField(
                                  'realPower',
                                  monitoringSample.der.realPower.phaseB,
                              )
                              .floatField(
                                  'voltage',
                                  monitoringSample.der.voltage.phaseB,
                              )
                        : null,
                    monitoringSample.der.realPower.phaseB
                        ? new Point('monitoringSample')
                              .tag('type', 'der')
                              .tag('phase', 'C')
                              .floatField(
                                  'realPower',
                                  monitoringSample.der.realPower.phaseC,
                              )
                              .floatField(
                                  'voltage',
                                  monitoringSample.der.voltage.phaseC,
                              )
                        : null,
                ].filter((point) => point !== null),
            );

            derHelper.onInverterData(invertersData);
            mirrorUsagePointListHelper.addSample(monitoringSample);
            inverterController.updateSunSpecInverterData({
                inverters: invertersData,
                monitoringSample,
            });
        },
    );
}

void main();
