import type { Config } from '../../helpers/config.js';
import { MqttSiteSamplePoller } from '../../meters/mqtt/index.js';
import { Powerwall2SiteSamplePoller } from '../../meters/powerwall2/index.js';
import { getSunSpecMeterConnection } from '../../sunspec/connections.js';
import { SunSpecMeterSiteSamplePoller } from '../../meters/sunspec/index.js';
import type { SiteSamplePollerBase } from '../../meters/siteSamplePollerBase.js';

export function getSiteSamplePollerInstance(
    config: Config,
): SiteSamplePollerBase {
    switch (config.meter.type) {
        case 'sunspec': {
            const meterConnection = getSunSpecMeterConnection(config.meter);

            return new SunSpecMeterSiteSamplePoller({ meterConnection });
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
