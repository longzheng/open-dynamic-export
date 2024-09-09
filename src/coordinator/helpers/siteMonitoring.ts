import type { Config } from '../../helpers/config.js';
import { MqttSiteMonitoringPoller } from '../../meters/mqtt/index.js';
import { Powerwall2SiteMonitoringPoller } from '../../meters/powerwall2/index.js';
import { getSunSpecMeterConnection } from '../../sunspec/connections.js';
import { SunSpecMeterPoller } from '../../sunspec/sunspecMeterPoller.js';
import type { SiteMonitoringPollerBase } from './siteMonitoringPollerBase.js';

export function getSiteMonitoringPollerInstance(
    config: Config,
): SiteMonitoringPollerBase {
    switch (config.meter.type) {
        case 'sunspec': {
            const meterConnection = getSunSpecMeterConnection(config.meter);

            return new SunSpecMeterPoller({ meterConnection });
        }
        case 'powerwall2': {
            return new Powerwall2SiteMonitoringPoller({
                config: config.meter,
            });
        }
        case 'mqtt': {
            return new MqttSiteMonitoringPoller({
                config: config.meter,
            });
        }
    }
}
