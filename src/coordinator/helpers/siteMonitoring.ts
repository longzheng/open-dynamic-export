import type { Config } from '../../helpers/config';
import { MqttSiteMonitoringPoller } from '../../meters/mqtt';
import { Powerwall2SiteMonitoringPoller } from '../../meters/powerwall2';
import { getSunSpecMeterConnection } from '../../sunspec/connections';
import { SunSpecMeterPoller } from '../../sunspec/sunspecMeterPoller';
import type { SiteMonitoringPollerBase } from './siteMonitoringPollerBase';

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
