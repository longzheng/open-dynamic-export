import 'dotenv/config';
import { getConfig } from '../helpers/config';
import { getSunSpecConnections } from '../sunspec/connections';
import { SunSpecDataHelper } from './helpers/sunspecData';
import { logger as pinoLogger } from '../helpers/logger';
import { InverterController } from './helpers/inverterController';
import { RampRateHelper } from './helpers/rampRate';
import { writeMonitoringSamplePoints } from '../helpers/influxdb';
import { getSep2Instance } from '../sep2';
import { ConfigControlLimit } from '../configLimit';

const logger = pinoLogger.child({ module: 'coordinator' });

const config = getConfig();

const { invertersConnections, metersConnections } =
    getSunSpecConnections(config);

const sunSpecDataEventEmitter = new SunSpecDataHelper({
    invertersConnections,
    metersConnections,
});

const rampRateHelper = new RampRateHelper();

const sep2 = getSep2Instance({
    config,
    invertersConnections,
    rampRateHelper,
});

const configLimit = new ConfigControlLimit({ config });

const inverterController = new InverterController({
    invertersConnections,
    applyControl: config.sunSpec.control,
    rampRateHelper,
    controlLimits: [sep2?.scheduledControlLimit, configLimit].filter(
        (controlLimit) => !!controlLimit,
    ),
});

sunSpecDataEventEmitter.on('data', ({ invertersData, monitoringSample }) => {
    logger.trace({ invertersData, monitoringSample }, 'Received SunSpec data');

    writeMonitoringSamplePoints(monitoringSample);

    sep2?.derHelper.onInverterData(invertersData);
    sep2?.mirrorUsagePointListHelper.addSample(monitoringSample);

    inverterController.updateSunSpecInverterData({
        inverters: invertersData,
        monitoringSample,
    });
});
