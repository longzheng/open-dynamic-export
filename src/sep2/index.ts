import type { RampRateHelper } from '../coordinator/helpers/rampRate';
import type { Config } from '../helpers/config';
import { env } from '../helpers/env';
import { logger } from '../helpers/logger';
import type { InverterSunSpecConnection } from '../sunspec/connection/inverter';
import { SEP2Client } from './client';
import { Sep2Limiter } from '../limiters/sep2';
import { DerHelper } from './helpers/der';
import { DerControlsHelper } from './helpers/derControls';
import { DerListHelper } from './helpers/derList';
import { EndDeviceListHelper } from './helpers/endDeviceList';
import { FunctionSetAssignmentsListHelper } from './helpers/functionSetAssignmentsList';
import { MirrorUsagePointListHelper } from './helpers/mirrorUsagePointList';
import { TimeHelper } from './helpers/time';
import { getSep2Certificate } from '../helpers/sep2Cert';

export function getSep2Limiter({
    config,
    invertersConnections,
    rampRateHelper,
}: {
    config: Config;
    invertersConnections: InverterSunSpecConnection[];
    rampRateHelper: RampRateHelper;
}) {
    if (!config.limiters.sep2) {
        return null;
    }

    const sep2Certificate = getSep2Certificate(config);

    const sep2Client = new SEP2Client({
        sep2Config: config.limiters.sep2,
        cert: sep2Certificate.cert,
        key: sep2Certificate.key,
        pen: env.SEP2_PEN,
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
        rampRateHelper,
    });

    const functionSetAssignmentsListHelper =
        new FunctionSetAssignmentsListHelper({
            client: sep2Client,
        });

    const mirrorUsagePointListHelper = new MirrorUsagePointListHelper({
        client: sep2Client,
    });

    const sep2Limiter = new Sep2Limiter({
        client: sep2Client,
        rampRateHelper,
    });

    const derControlsHelper = new DerControlsHelper({
        client: sep2Client,
    }).on('data', (data) => {
        logger.debug(data, 'DER controls data changed');

        sep2Limiter.updateSep2ControlsData(data);

        rampRateHelper.setDefaultDERControlRampRate(
            data.fallbackControl.type === 'default'
                ? (data.fallbackControl.data.defaultControl.setGradW ?? null)
                : null,
        );
    });

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

    return {
        sep2Client,
        derHelper,
        mirrorUsagePointListHelper,
        sep2Limiter,
    };
}
