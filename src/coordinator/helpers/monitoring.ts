import { assertNonNull } from '../../helpers/null';
import type { PerPhaseMeasurement } from '../../helpers/power';
import { getAggregatedInverterMetrics } from '../../sunspec/helpers/inverterMetrics';
import { getAggregatedMeterMetrics } from '../../sunspec/helpers/meterMetrics';
import type { InverterModel } from '../../sunspec/models/inverter';
import { type MeterModel } from '../../sunspec/models/meter';

export type MonitoringSample = {
    date: Date;
    site: {
        realPower: PerPhaseMeasurement;
        reactivePower: PerPhaseMeasurement;
        voltage: PerPhaseMeasurement;
        frequency: number;
    };
    der: {
        realPower: PerPhaseMeasurement;
        reactivePower: number;
        voltage: PerPhaseMeasurement;
        frequency: number;
    };
};

export function generateMonitoringSample({
    inverters,
    meters,
}: {
    inverters: InverterModel[];
    meters: MeterModel[];
}): MonitoringSample {
    const aggregatedMeterMetrics = getAggregatedMeterMetrics(meters);
    const aggregatedInverterMetrics = getAggregatedInverterMetrics(inverters);

    return {
        date: new Date(),
        site: {
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
        },
        der: {
            realPower: {
                // inverter W is only single phase
                // we have to manually calculate per phase power using voltage * current
                phaseA: aggregatedInverterMetrics.PhVphA
                    ? aggregatedInverterMetrics.AphA *
                      aggregatedInverterMetrics.PhVphA
                    : aggregatedInverterMetrics.W,
                phaseB: aggregatedInverterMetrics.PhVphB
                    ? aggregatedInverterMetrics.AphB *
                      aggregatedInverterMetrics.PhVphB
                    : null,
                phaseC: aggregatedInverterMetrics.PhVphC
                    ? aggregatedInverterMetrics.AphB *
                      aggregatedInverterMetrics.PhVphC
                    : null,
            },
            reactivePower: aggregatedInverterMetrics.VAr ?? 0,
            voltage: {
                phaseA: assertNonNull(aggregatedInverterMetrics.PhVphA),
                phaseB: aggregatedInverterMetrics.PhVphB,
                phaseC: aggregatedInverterMetrics.PhVphC,
            },
            frequency: aggregatedInverterMetrics.Hz,
        },
    };
}

export function getSamplesIntervalSeconds(
    samples: Pick<MonitoringSample, 'date'>[],
) {
    // assume samples are in order from oldest to newest
    if (samples.length < 2) {
        return 0;
    }

    const oldest = samples.at(0)!.date;
    const newest = samples.at(-1)!.date;

    return Math.round((newest.getTime() - oldest.getTime()) / 1000);
}
