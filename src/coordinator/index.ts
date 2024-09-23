import 'dotenv/config';
import { getConfig } from '../helpers/config.js';
import { logger as pinoLogger } from '../helpers/logger.js';
import { InverterController } from './helpers/inverterController.js';
import { RampRateHelper } from '../sep2/helpers/rampRate.js';
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
import { InvertersPoller } from './helpers/inverterSample.js';

const logger = pinoLogger.child({ module: 'coordinator' });

export type Coordinator = {
    invertersPoller: InvertersPoller;
    siteSamplePoller: SiteSamplePollerBase;
    destroy: () => void;
};

export function createCoordinator(): Coordinator {
    const config = getConfig();

    const invertersPoller = new InvertersPoller({ config });

    const siteSamplePoller = getSiteSamplePollerInstance(config);

    const rampRateHelper = new RampRateHelper();

    const sep2 = getSep2Limiter({
        config,
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
        limiters,
        onControl: (InverterController) =>
            invertersPoller.onControl(InverterController),
    });

    invertersPoller.on('data', ({ invertersData, derSample }) => {
        writeDerSamplePoints(derSample);

        rampRateHelper.onInverterData(invertersData);

        sep2?.derHelper.onInverterData(invertersData);
        sep2?.mirrorUsagePointListHelper.addDerSample(derSample);

        inverterController.updateSunSpecInverterData({
            invertersData,
            derSample,
        });
    });

    siteSamplePoller.on('data', ({ siteSample }) => {
        writeSiteSamplePoints(siteSample);

        sep2?.mirrorUsagePointListHelper.addSiteSample(siteSample);

        inverterController.updateSiteSample(siteSample);
    });

    return {
        invertersPoller,
        siteSamplePoller,
        destroy: () => {
            logger.info('Destroying coordinator');

            siteSamplePoller.destroy();
        },
    };
}
