import type { Config } from '../../helpers/config.js';
import { MqttSiteSamplePoller } from '../../meters/mqtt/index.js';
import { Powerwall2SiteSamplePoller } from '../../meters/powerwall2/index.js';
import { SunSpecMeterSiteSamplePoller } from '../../meters/sunspec/index.js';
import type { SiteSamplePollerBase } from '../../meters/siteSamplePollerBase.js';
import type { InvertersPoller } from './inverterSample.js';

export function getSiteSamplePollerInstance({
    config,
    invertersPoller,
}: {
    config: Config;
    invertersPoller: InvertersPoller;
}): SiteSamplePollerBase {
    switch (config.meter.type) {
        case 'sunspec': {
            return new SunSpecMeterSiteSamplePoller({
                config: config.meter,
                invertersPoller,
            });
        }
        case 'powerwall2': {
            return new Powerwall2SiteSamplePoller({
                config: config.meter,
            });
        }
        case 'mqtt': {
            return new MqttSiteSamplePoller({
                config: config.meter,
            });
        }
    }
}
