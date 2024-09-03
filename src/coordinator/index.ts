import 'dotenv/config';
import { getConfig } from '../helpers/config';
import { getSunSpecConnections } from '../sunspec/connections';
import { SunSpecDataHelper } from './helpers/sunspecData';
import { logger as pinoLogger } from '../helpers/logger';
import { InverterController } from './helpers/inverterController';
import { RampRateHelper } from './helpers/rampRate';
import {
    writeDerMonitoringSamplePoints,
    writeSiteMonitoringSamplePoints,
} from '../helpers/influxdb';
import { getSep2Limiter } from '../sep2';
import { FixedLimiter } from '../limiters/fixed';
import { AmberLimiter } from '../limiters/amber';

const logger = pinoLogger.child({ module: 'coordinator' });

const config = getConfig();

const { invertersConnections, metersConnections } =
    getSunSpecConnections(config);

const sunSpecDataEventEmitter = new SunSpecDataHelper({
    invertersConnections,
    metersConnections,
});

const rampRateHelper = new RampRateHelper();

const sep2 = getSep2Limiter({
    config,
    invertersConnections,
    rampRateHelper,
});

const limiters = [
    sep2?.sep2Limiter,
    config.limiters.fixed
        ? new FixedLimiter({ config: config.limiters.fixed })
        : null,
    config.limiters.negativeFeedIn?.type === 'amber'
        ? new AmberLimiter({
              apiKey: config.limiters.negativeFeedIn.apiKey,
              siteId: config.limiters.negativeFeedIn.siteId,
          })
        : null,
].filter((controlLimit) => !!controlLimit);

const inverterController = new InverterController({
    invertersConnections,
    applyControl: config.sunSpec.control,
    rampRateHelper,
    limiters,
});

sunSpecDataEventEmitter.on(
    'data',
    ({ invertersData, derMonitoringSample, siteMonitoringSample }) => {
        writeSiteMonitoringSamplePoints(siteMonitoringSample);
        writeDerMonitoringSamplePoints(derMonitoringSample);

        sep2?.derHelper.onInverterData(invertersData);
        sep2?.mirrorUsagePointListHelper.addDerMonitoringSample(
            derMonitoringSample,
        );
        sep2?.mirrorUsagePointListHelper.addSiteMonitoringSample(
            siteMonitoringSample,
        );

        inverterController.updateSunSpecInverterData({
            inverters: invertersData,
            siteMonitoringSample,
            derMonitoringSample,
        });
    },
);
