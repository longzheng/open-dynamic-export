import { SiteMonitoringPollerBase } from '../../coordinator/helpers/siteMonitoringPollerBase';
import type { SiteMonitoringSampleData } from '../../coordinator/helpers/siteMonitoringSample';
import { Powerwall2Client } from './client';
import type { z } from 'zod';
import type { metersSiteSchema } from './api';
import type { Config } from '../../helpers/config';

export class Powerwall2SiteMonitoringPoller extends SiteMonitoringPollerBase {
    private client: Powerwall2Client;

    constructor({
        config,
    }: {
        config: Extract<Config['meter'], { type: 'powerwall2' }>;
    }) {
        super({
            meterName: 'powerwall2',
            pollingIntervalMs: 200,
        });

        this.client = new Powerwall2Client({
            ip: config.ip,
            password: config.password,
        });

        void this.startPolling();
    }

    override async getSiteMonitoringSampleData(): Promise<SiteMonitoringSampleData | null> {
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
    meter: z.infer<typeof metersSiteSchema>;
}): SiteMonitoringSampleData {
    const firstMeter = meter[0];

    if (!firstMeter) {
        throw new Error('no meter found');
    }

    return {
        realPower: {
            type: 'perPhase',
            phaseA: firstMeter.Cached_readings.real_power_a,
            phaseB: firstMeter.Cached_readings.real_power_b ?? null,
            phaseC: firstMeter.Cached_readings.real_power_c ?? null,
        },
        reactivePower: {
            type: 'perPhase',
            phaseA: firstMeter.Cached_readings.reactive_power_a,
            phaseB: firstMeter.Cached_readings.reactive_power_b ?? null,
            phaseC: firstMeter.Cached_readings.reactive_power_c ?? null,
        },
        voltage: {
            type: 'perPhase',
            phaseA: firstMeter.Cached_readings.v_l1n,
            phaseB: firstMeter.Cached_readings.v_l2n ?? null,
            phaseC: firstMeter.Cached_readings.v_l3n ?? null,
        },
        // powerwall 2 does not provide site frequency
        // the value Cached_readings.frequency is always 0
        frequency: null,
    };
}