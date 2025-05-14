import { type Config } from '../../helpers/config.js';
import { MqttSiteSamplePoller } from '../../meters/mqtt/index.js';
import { Powerwall2SiteSamplePoller } from '../../meters/powerwall2/index.js';
import { SunSpecMeterSiteSamplePoller } from '../../meters/sunspec/index.js';
import { SunSpecfloatMeterSiteSamplePoller } from '../../meters/sunspecfloat/index.js';
import { type SiteSamplePollerBase } from '../../meters/siteSamplePollerBase.js';
import { type InvertersPoller } from './inverterSample.js';
import { SmaMeterSiteSamplePoller } from '../../meters/sma/index.js';

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
                sunspecMeterConfig: config.meter,
                invertersPoller,
            });
        }
        case 'sunspecfloat': {
            return new SunSpecfloatMeterSiteSamplePoller({
                sunspecMeterConfig: config.meter,
                invertersPoller,
            });
        }
        case 'powerwall2': {
            return new Powerwall2SiteSamplePoller({
                powerwall2Config: config.meter,
            });
        }
        case 'mqtt': {
            return new MqttSiteSamplePoller({
                mqttConfig: config.meter,
            });
        }
        case 'sma': {
            return new SmaMeterSiteSamplePoller({
                smaMeterConfig: config.meter,
            });
        }
    }
}
