import { SiteMonitoringPollerBase } from '../../coordinator/helpers/siteMonitoringPollerBase';
import type { SiteMonitoringSampleData } from '../../coordinator/helpers/siteMonitoringSample';
import { Powerwall2Client } from './client';
import type { z } from 'zod';
import type { metersSiteSchema } from './api';

export class Powerwall2SiteMonitoringPoller extends SiteMonitoringPollerBase {
    private client: Powerwall2Client;

    constructor({ ip, password }: { ip: string; password: string }) {
        super({
            meterName: 'powerwall2',
            pollingIntervalMs: 200,
        });

        this.client = new Powerwall2Client({
            ip,
            password,
        });

        void this.startPolling();
    }

    override async getSiteMonitoringSampleData(): Promise<SiteMonitoringSampleData> {
        const metersSiteData = await this.client.getMetersSite();

        this.logger.trace({ metersSiteData }, 'received data');

        const siteMonitoringSample = generateSiteMonitoringSample({
            meter: metersSiteData,
        });

        return siteMonitoringSample;
    }
}

export function generateSiteMonitoringSample({
    meter,
}: {
    meter: z.TypeOf<typeof metersSiteSchema>;
}): SiteMonitoringSampleData {
    const firstMeter = meter[0];

    if (!firstMeter) {
        throw new Error('no meters found');
    }

    return {
        realPower: {
            phaseA: firstMeter.Cached_readings.real_power_a,
            phaseB: firstMeter.Cached_readings.real_power_b ?? null,
            phaseC: firstMeter.Cached_readings.real_power_c ?? null,
        },
        reactivePower: {
            phaseA: firstMeter.Cached_readings.reactive_power_a,
            phaseB: firstMeter.Cached_readings.reactive_power_b ?? null,
            phaseC: firstMeter.Cached_readings.reactive_power_c ?? null,
        },
        voltage: {
            phaseA: firstMeter.Cached_readings.v_l1n,
            phaseB: firstMeter.Cached_readings.v_l2n ?? null,
            phaseC: firstMeter.Cached_readings.v_l3n ?? null,
        },
        // TODO: this seems to be 0
        frequency: firstMeter.Cached_readings.frequency,
    };
}
