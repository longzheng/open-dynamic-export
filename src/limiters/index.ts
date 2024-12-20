import { type Config, type LimiterKeys } from '../helpers/config.js';
import { FixedLimiter } from './fixed/index.js';
import { type LimiterType } from './limiter.js';
import { MqttLimiter } from './mqtt/index.js';
import { AmberLimiter } from './negativeFeedIn/amber/index.js';
import { AusgridEA029Limiter } from './twoWayTariff/ausgridEA029/index.js';
import { SapnRELE2WLimiter } from './twoWayTariff/sapnRELE2W/index.js';
import { type Sep2Instance } from '../sep2/index.js';

export type Limiters = Record<LimiterKeys, LimiterType | null>;

export function getLimiters({
    config,
    sep2Instance,
}: {
    config: Config;
    sep2Instance: Sep2Instance | null;
}): Limiters {
    return {
        csipAus: sep2Instance?.limiter ?? null,
        fixed: config.limiters.fixed
            ? new FixedLimiter({ config: config.limiters.fixed })
            : null,
        negativeFeedIn:
            config.limiters.negativeFeedIn?.type === 'amber'
                ? new AmberLimiter({
                      apiKey: config.limiters.negativeFeedIn.apiKey,
                      siteId: config.limiters.negativeFeedIn.siteId,
                  })
                : null,
        twoWayTariff: (() => {
            switch (config.limiters.twoWayTariff?.type) {
                case 'ausgridEA029':
                    return new AusgridEA029Limiter();
                case 'sapnRELE2W':
                    return new SapnRELE2WLimiter();
                case undefined:
                    return null;
            }
        })(),
        mqtt: config.limiters.mqtt
            ? new MqttLimiter({ config: config.limiters.mqtt })
            : null,
    };
}
