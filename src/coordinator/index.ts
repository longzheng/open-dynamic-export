import 'dotenv/config';
import { getConfig } from '../helpers/config';
import {
    getSunSpecInvertersConnections,
    getSunSpecMeterConnection,
} from '../sunspec/connections';
import { SunSpecInverterPoller } from '../sunspec/sunspecInverterPoller';
import { logger as pinoLogger } from '../helpers/logger';
import { InverterController } from './helpers/inverterController';
import { RampRateHelper } from './helpers/rampRate';
import {
    writeDerMonitoringSamplePoints,
    writeSiteMonitoringSamplePoints,
} from '../helpers/influxdb';
import { getSep2Limiter } from '../sep2';
import { FixedLimiter } from '../limiters/fixed';
import { AmberLimiter } from '../limiters/negativeFeedIn/amber';
import { SunSpecMeterPoller } from '../sunspec/sunspecMeterPoller';
import { AusgridEA029Limiter } from '../limiters/twoWayTariff/ausgridEA029';
import { SapnRELE2WLimiter } from '../limiters/twoWayTariff/sapnRELE2W';

const logger = pinoLogger.child({ module: 'coordinator' });

const config = getConfig();

const invertersConnections = getSunSpecInvertersConnections(config);

const meterConnection = getSunSpecMeterConnection(config);

const sunSpecInverterPoller = new SunSpecInverterPoller({
    invertersConnections,
});

const sunSpecMeterPoller = new SunSpecMeterPoller({
    meterConnection,
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
    config.limiters.twoWayTariff?.type === 'ausgridEA029'
        ? new AusgridEA029Limiter()
        : null,
    config.limiters.twoWayTariff?.type === 'sapnRELE2W'
        ? new SapnRELE2WLimiter()
        : null,
].filter((controlLimit) => !!controlLimit);

const inverterController = new InverterController({
    invertersConnections,
    applyControl: config.inverterControl,
    rampRateHelper,
    limiters,
});

sunSpecInverterPoller.on('data', ({ invertersData, derMonitoringSample }) => {
    writeDerMonitoringSamplePoints(derMonitoringSample);

    sep2?.derHelper.onInverterData(invertersData);
    sep2?.mirrorUsagePointListHelper.addDerMonitoringSample(
        derMonitoringSample,
    );

    inverterController.updateSunSpecInverterData({
        inverters: invertersData,
        derMonitoringSample,
    });
});

sunSpecMeterPoller.on('data', ({ siteMonitoringSample }) => {
    writeSiteMonitoringSamplePoints(siteMonitoringSample);

    sep2?.mirrorUsagePointListHelper.addSiteMonitoringSample(
        siteMonitoringSample,
    );

    inverterController.updateSiteMonitoringSample(siteMonitoringSample);
});
