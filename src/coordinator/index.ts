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
import { AmberControlLimit } from '../negativeFeedIn/amber';

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

const controlLimits = [
    sep2?.scheduledControlLimit,
    config.limit ? new ConfigControlLimit({ config: config.limit }) : null,
    config.negativeFeedIn?.type === 'amber'
        ? new AmberControlLimit({
              apiKey: config.negativeFeedIn.apiKey,
              siteId: config.negativeFeedIn.siteId,
          })
        : null,
].filter((controlLimit) => !!controlLimit);

const inverterController = new InverterController({
    invertersConnections,
    applyControl: config.sunSpec.control,
    rampRateHelper,
    controlLimits,
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
