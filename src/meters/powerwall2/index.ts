import { SiteSamplePollerBase } from '../siteSamplePollerBase.js';
import type { SiteSampleData } from '../siteSample.js';
import { Powerwall2Client } from './client.js';
import type { z } from 'zod';
import type { metersSiteSchema } from './api.js';
import type { Config } from '../../helpers/config.js';

export class Powerwall2SiteSamplePoller extends SiteSamplePollerBase {
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

    override async getSiteSampleData(): Promise<SiteSampleData | null> {
        const metersSiteData = await this.client.getMetersSite();

        this.logger.trace({ metersSiteData }, 'received data');

        const siteSample = generateSiteSample({
            meter: metersSiteData,
        });

        return siteSample;
    }
}

export function generateSiteSample({
    meter,
}: {
    meter: z.infer<typeof metersSiteSchema>;
}): SiteSampleData {
    const firstMeter = meter[0];

    if (!firstMeter) {
        throw new Error('no meter found');
    }

    return {
        realPower: {
            type: 'perPhaseNet',
            phaseA: firstMeter.Cached_readings.real_power_a,
            phaseB: firstMeter.Cached_readings.real_power_b ?? null,
            phaseC: firstMeter.Cached_readings.real_power_c ?? null,
            net: firstMeter.Cached_readings.instant_power,
        },
        reactivePower: {
            type: 'perPhaseNet',
            phaseA: firstMeter.Cached_readings.reactive_power_a,
            phaseB: firstMeter.Cached_readings.reactive_power_b ?? null,
            phaseC: firstMeter.Cached_readings.reactive_power_c ?? null,
            net: firstMeter.Cached_readings.instant_reactive_power,
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
