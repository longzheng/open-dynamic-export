import { assertNonNull } from '../../helpers/null';
import type { PerPhaseMeasurement } from '../../helpers/power';
import { getAggregatedMeterMetrics } from '../../sunspec/helpers/meterMetrics';
import { type MeterModel } from '../../sunspec/models/meter';
import type { MonitoringSampleBase } from './monitoring';

export type SiteMonitoringSample = MonitoringSampleBase & {
    realPower: PerPhaseMeasurement;
    reactivePower: PerPhaseMeasurement;
    voltage: PerPhaseMeasurement;
    frequency: number;
};

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
