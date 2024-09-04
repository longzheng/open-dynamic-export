import { SiteMonitoringPollerBase } from '../../coordinator/helpers/siteMonitoringPollerBase';
import type { SiteMonitoringSampleData } from '../../coordinator/helpers/siteMonitoringSample';

export class Powerwall2SiteMonitoringPoller extends SiteMonitoringPollerBase {
    constructor() {
        super({
            meterName: 'powerwall2',
            pollingIntervalMs: 200,
        });
    }

    override getSiteMonitoringSampleData(): Promise<SiteMonitoringSampleData> {
        throw new Error('Method not implemented.');
    }
}
