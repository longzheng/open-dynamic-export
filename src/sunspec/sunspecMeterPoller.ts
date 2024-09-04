import type { MeterSunSpecConnection } from './connection/meter';
import { logger as pinoLogger } from '../helpers/logger';
import { type SiteMonitoringSample } from '../coordinator/helpers/siteMonitoringSample';
import { SiteMonitoringPollerBase } from '../coordinator/helpers/siteMonitoringPollerBase';
import { assertNonNull } from '../helpers/null';
import { getAggregatedMeterMetrics } from './helpers/meterMetrics';
import type { MeterModel } from './models/meter';

const logger = pinoLogger.child({ module: 'SunSpecMeterPoller' });

export class SunSpecMeterPoller extends SiteMonitoringPollerBase {
    private metersConnections: MeterSunSpecConnection[];

    constructor({
        metersConnections,
    }: {
        metersConnections: MeterSunSpecConnection[];
    }) {
        super({ meterName: 'SunSpecMeterPoller', pollingIntervalMs: 200 });

        this.metersConnections = metersConnections;

        void this.run();
    }

    override async getSiteMonitoringSample(): Promise<
        Omit<SiteMonitoringSample, 'date'>
    > {
        const metersData = await Promise.all(
            this.metersConnections.map(async (meter) => {
                return {
                    meter: await meter.getMeterModel(),
                };
            }),
        );

        logger.trace({ metersData }, 'received data');

        const siteMonitoringSample = generateSiteMonitoringSample({
            meters: metersData.map(({ meter }) => meter),
        });

        return siteMonitoringSample;
    }
}

export function generateSiteMonitoringSample({
    meters,
}: {
    meters: MeterModel[];
}): SiteMonitoringSample {
    const aggregatedMeterMetrics = getAggregatedMeterMetrics(meters);

    return {
        date: new Date(),
        realPower: {
            phaseA: aggregatedMeterMetrics.WphA ?? aggregatedMeterMetrics.W,
            phaseB: aggregatedMeterMetrics.WphB,
            phaseC: aggregatedMeterMetrics.WphC,
        },
        reactivePower: {
            phaseA: assertNonNull(
                aggregatedMeterMetrics.VARphA ?? aggregatedMeterMetrics.VAR,
            ),
            phaseB: aggregatedMeterMetrics.VARphB,
            phaseC: aggregatedMeterMetrics.VARphC,
        },
        voltage: {
            phaseA: assertNonNull(
                aggregatedMeterMetrics.PhVphA ?? aggregatedMeterMetrics.PhV,
            ),
            phaseB: aggregatedMeterMetrics.PhVphB,
            phaseC: aggregatedMeterMetrics.PhVphC,
        },
        frequency: aggregatedMeterMetrics.Hz,
    };
}
