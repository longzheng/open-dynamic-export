import 'dotenv/config';
import { getConfig } from '../helpers/config.js';
import { getSunSpecInvertersConnections } from '../sunspec/connections.js';
import { SunSpecInverterPoller } from '../sunspec/sunspecInverterPoller.js';
import { logger as pinoLogger } from '../helpers/logger.js';
import { InverterController } from './helpers/inverterController.js';
import { RampRateHelper } from './helpers/rampRate.js';
import {
    writeDerSamplePoints,
    writeSiteSamplePoints,
} from '../helpers/influxdb.js';
import { getSep2Limiter } from '../sep2/index.js';
import { FixedLimiter } from '../limiters/fixed/index.js';
import { AmberLimiter } from '../limiters/negativeFeedIn/amber/index.js';
import { AusgridEA029Limiter } from '../limiters/twoWayTariff/ausgridEA029/index.js';
import { SapnRELE2WLimiter } from '../limiters/twoWayTariff/sapnRELE2W/index.js';
import { getSiteSamplePollerInstance } from './helpers/siteSample.js';
import { MqttLimiter } from '../limiters/mqtt/index.js';
import type { SiteSamplePollerBase } from '../meters/siteSamplePollerBase.js';

const logger = pinoLogger.child({ module: 'coordinator' });

export type Coordinator = {
    siteSamplePoller: SiteSamplePollerBase;
    destroy: () => void;
};

export function createCoordinator(): Coordinator {
    const config = getConfig();

    const invertersConnections = getSunSpecInvertersConnections(config);

    const siteSamplePoller = getSiteSamplePollerInstance(config);

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

    sunSpecInverterPoller.on('data', ({ inverters, derSample }) => {
        writeDerSamplePoints(derSample);

        sep2?.derHelper.onInverterData(inverters);
        sep2?.mirrorUsagePointListHelper.addDerSample(derSample);

        inverterController.updateSunSpecInverterData({
            inverters,
            derSample,
        });
    });

    siteSamplePoller.on('data', ({ siteSample }) => {
        writeSiteSamplePoints(siteSample);

        sep2?.mirrorUsagePointListHelper.addSiteSample(siteSample);

        inverterController.updateSiteSample(siteSample);
    });

    return {
        siteSamplePoller,
        destroy: () => {
            siteSamplePoller.destroy();
        },
    };
}
