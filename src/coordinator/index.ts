import 'dotenv/config';
import { getConfig } from '../helpers/config.js';
import { getSunSpecInvertersConnections } from '../sunspec/connections.js';
import { SunSpecInverterPoller } from '../sunspec/sunspecInverterPoller.js';
import { logger as pinoLogger } from '../helpers/logger.js';
import { InverterController } from './helpers/inverterController.js';
import { RampRateHelper } from './helpers/rampRate.js';
import {
    writeDerMonitoringSamplePoints,
    writeSiteMonitoringSamplePoints,
} from '../helpers/influxdb.js';
import { getSep2Limiter } from '../sep2/index.js';
import { FixedLimiter } from '../limiters/fixed/index.js';
import { AmberLimiter } from '../limiters/negativeFeedIn/amber/index.js';
import { AusgridEA029Limiter } from '../limiters/twoWayTariff/ausgridEA029/index.js';
import { SapnRELE2WLimiter } from '../limiters/twoWayTariff/sapnRELE2W/index.js';
import { getSiteMonitoringPollerInstance } from './helpers/siteMonitoring.js';
import { MqttLimiter } from '../limiters/mqtt/index.js';
import type { SiteMonitoringPollerBase } from './helpers/siteMonitoringPollerBase.js';

const logger = pinoLogger.child({ module: 'coordinator' });

export type Coordinator = {
    siteMonitoringPoller: SiteMonitoringPollerBase;
    destroy: () => void;
};

export function createCoordinator(): Coordinator {
    const config = getConfig();

    const invertersConnections = getSunSpecInvertersConnections(config);

    const siteMonitoringPoller = getSiteMonitoringPollerInstance(config);

    const sunSpecInverterPoller = new SunSpecInverterPoller({
        invertersConnections,
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
        config.limiters.mqtt
            ? new MqttLimiter({ config: config.limiters.mqtt })
            : null,
    ].filter((controlLimit) => !!controlLimit);

    const inverterController = new InverterController({
        invertersConnections,
        applyControl: config.inverterControl,
        rampRateHelper,
        limiters,
    });

    sunSpecInverterPoller.on(
        'data',
        ({ invertersData, derMonitoringSample }) => {
            writeDerMonitoringSamplePoints(derMonitoringSample);

            sep2?.derHelper.onInverterData(invertersData);
            sep2?.mirrorUsagePointListHelper.addDerMonitoringSample(
                derMonitoringSample,
            );

            inverterController.updateSunSpecInverterData({
                inverters: invertersData,
                derMonitoringSample,
            });
        },
    );

    siteMonitoringPoller.on('data', ({ siteMonitoringSample }) => {
        writeSiteMonitoringSamplePoints(siteMonitoringSample);

        sep2?.mirrorUsagePointListHelper.addSiteMonitoringSample(
            siteMonitoringSample,
        );

        inverterController.updateSiteMonitoringSample(siteMonitoringSample);
    });

    return {
        siteMonitoringPoller,
        destroy: () => {
            siteMonitoringPoller.destroy();
        },
    };
}
