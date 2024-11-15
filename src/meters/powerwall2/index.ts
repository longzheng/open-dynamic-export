import { SiteSamplePollerBase } from '../siteSamplePollerBase.js';
import { type SiteSample } from '../siteSample.js';
import { type z } from 'zod';
import { type Config } from '../../helpers/config.js';
import { type Result } from '../../helpers/result.js';
import { getPowerwall2Client } from '../../connections/powerwall2/getClient.js';
import { type Powerwall2Client } from '../../connections/powerwall2/client.js';
import { type metersSiteSchema } from '../../connections/powerwall2/api.js';

export class Powerwall2SiteSamplePoller extends SiteSamplePollerBase {
    private client: Powerwall2Client;

    constructor({
        powerwall2Config,
    }: {
        powerwall2Config: Extract<Config['meter'], { type: 'powerwall2' }>;
    }) {
        super({
            name: 'powerwall2',
            pollingIntervalMs: 200,
        });

        this.client = getPowerwall2Client({
            ip: powerwall2Config.ip,
            password: powerwall2Config.password,
            timeoutSeconds: powerwall2Config.timeoutSeconds,
        });

        void this.startPolling();
    }

    override async getSiteSample(): Promise<Result<SiteSample>> {
        try {
            const start = performance.now();

            const metersSiteData = await this.client.getMetersSite();

            const end = performance.now();
            const duration = end - start;

            this.logger.trace(
                { duration, metersSiteData },
                'polled Powerwall meter site data',
            );

            const siteSample = generateSiteSample({
                meter: metersSiteData,
            });

            return { success: true, value: siteSample };
        } catch (error) {
            return {
                success: false,
                error: new Error(
                    `Error loading Powerwall2 data: ${error instanceof Error ? error.message : 'Unknown error'}`,
                ),
            };
        }
    }

    override onDestroy() {}
}

export function generateSiteSample({
    meter,
}: {
    meter: z.infer<typeof metersSiteSchema>;
}): SiteSample {
    const firstMeter = meter[0];

    if (!firstMeter) {
        throw new Error('no meter found');
    }

    return {
        date: new Date(),
        realPower: {
            type: 'perPhaseNet',
            phaseA: firstMeter.Cached_readings.real_power_a ?? 0,
            phaseB: firstMeter.Cached_readings.real_power_b ?? null,
            phaseC: firstMeter.Cached_readings.real_power_c ?? null,
            net: firstMeter.Cached_readings.instant_power,
        },
        reactivePower: {
            type: 'perPhaseNet',
            phaseA: firstMeter.Cached_readings.reactive_power_a ?? 0,
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
