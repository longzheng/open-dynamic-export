import type { MeterSunSpecConnection } from '../../sunspec/connection/meter.js';
import type { SiteSample } from '../siteSample.js';
import { SiteSamplePollerBase } from '../siteSamplePollerBase.js';
import { assertNonNull } from '../../helpers/null.js';
import { getMeterMetrics } from '../../sunspec/helpers/meterMetrics.js';
import type { MeterModel } from '../../sunspec/models/meter.js';
import type { Result } from '../../helpers/result.js';
import type { InvertersPoller } from '../../coordinator/helpers/inverterSample.js';
import { getSunSpecMeterConnection } from '../../sunspec/connections.js';
import type { Config } from '../../helpers/config.js';
import type { DerSample } from '../../coordinator/helpers/derSample.js';

type SunSpecMeterConfig = Extract<Config['meter'], { type: 'sunspec' }>;

type MeterLocation = SunSpecMeterConfig['location'];

export class SunSpecMeterSiteSamplePoller extends SiteSamplePollerBase {
    private meterConnection: MeterSunSpecConnection;
    private location: MeterLocation;
    private derSampleCache: DerSample | null = null;

    constructor({
        sunspecMeterConfig,
        invertersPoller,
    }: {
        sunspecMeterConfig: SunSpecMeterConfig;
        invertersPoller: InvertersPoller;
    }) {
        super({ name: 'SunSpecMeterPoller', pollingIntervalMs: 200 });

        this.meterConnection = getSunSpecMeterConnection(sunspecMeterConfig);
        this.location = sunspecMeterConfig.location;

        invertersPoller.on('data', (derSample) => {
            this.derSampleCache = derSample;
        });

        void this.startPolling();
    }

    override async getSiteSample(): Promise<Result<SiteSample>> {
        try {
            const start = performance.now();

            const meterModel = await this.meterConnection.getMeterModel();

            const end = performance.now();
            const duration = end - start;

            this.logger.trace(
                { duration, meterModel },
                'polled SunSpec meter data',
            );

            const siteSample = (() => {
                const sample = generateSiteSample({
                    meter: meterModel,
                });

                switch (this.location) {
                    case 'consumption':
                        return convertConsumptionMeteringToFeedInMetering({
                            siteSample: sample,
                            derSample: this.derSampleCache,
                        });
                    case 'feedin':
                        return sample;
                }
            })();

            return { success: true, value: siteSample };
        } catch (error) {
            return {
                success: false,
                error: new Error(
                    `Error loading SunSpec meter data: ${
                        error instanceof Error ? error.message : 'Unknown error'
                    }`,
                ),
            };
        }
    }

    override onDestroy() {
        this.meterConnection.client.close(() => {});
    }
}

function generateSiteSample({ meter }: { meter: MeterModel }): SiteSample {
    const meterMetrics = getMeterMetrics(meter);

    return {
        date: new Date(),
        realPower: meterMetrics.WphA
            ? {
                  type: 'perPhaseNet',
                  phaseA: meterMetrics.WphA,
                  phaseB: meterMetrics.WphB,
                  phaseC: meterMetrics.WphC,
                  net: meterMetrics.W,
              }
            : { type: 'noPhase', net: meterMetrics.W },
        reactivePower: meterMetrics.VARphA
            ? {
                  type: 'perPhaseNet',
                  phaseA: meterMetrics.VARphA,
                  phaseB: meterMetrics.VARphB,
                  phaseC: meterMetrics.VARphC,
                  net: assertNonNull(meterMetrics.VAR),
              }
            : {
                  type: 'noPhase',
                  net: assertNonNull(meterMetrics.VAR),
              },
        voltage: {
            type: 'perPhase',
            phaseA: assertNonNull(meterMetrics.PhVphA ?? meterMetrics.PhV),
            phaseB: meterMetrics.PhVphB,
            phaseC: meterMetrics.PhVphC,
        },
        frequency: meterMetrics.Hz,
    };
}

function convertConsumptionMeteringToFeedInMetering({
    siteSample,
    derSample,
}: {
    siteSample: SiteSample;
    derSample: DerSample | null;
}): SiteSample {
    if (!derSample) {
        throw new Error(
            'Cannot convert consumption metering to feed-in metering without DER data',
        );
    }

    const siteRealPower = convertConsumptionRealPowerToFeedInRealPower({
        consumptionRealPower: siteSample.realPower,
        derRealPower: derSample.realPower,
    });

    return {
        ...siteSample,
        realPower: siteRealPower,
    };
}

export function convertConsumptionRealPowerToFeedInRealPower({
    consumptionRealPower,
    derRealPower,
}: {
    consumptionRealPower: SiteSample['realPower'];
    derRealPower: DerSample['realPower'];
}): SiteSample['realPower'] {
    if (
        consumptionRealPower.type === 'perPhaseNet' &&
        derRealPower.type === 'perPhaseNet'
    ) {
        return {
            type: 'perPhaseNet',
            phaseA: (derRealPower.phaseA + consumptionRealPower.phaseA) * -1,
            phaseB:
                ((derRealPower.phaseB ?? 0) +
                    (consumptionRealPower.phaseB ?? 0)) *
                -1,
            phaseC:
                ((derRealPower.phaseC ?? 0) +
                    (consumptionRealPower.phaseC ?? 0)) *
                -1,
            net: (derRealPower.net + consumptionRealPower.net) * -1,
        };
    }

    return {
        type: 'noPhase',
        net: (derRealPower.net + consumptionRealPower.net) * -1,
    };
}
