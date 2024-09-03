import { assertNonNull } from '../../helpers/null';
import type { PerPhaseMeasurement } from '../../helpers/power';
import { getAggregatedInverterMetrics } from '../../sunspec/helpers/inverterMetrics';
import type { InverterModel } from '../../sunspec/models/inverter';
import type { MonitoringSampleBase } from './monitoring';

export type DerMonitoringSample = MonitoringSampleBase & {
    realPower: PerPhaseMeasurement;
    reactivePower: number;
    voltage: PerPhaseMeasurement;
    frequency: number;
};

export function generateDerMonitoringSample({
    inverters,
}: {
    inverters: InverterModel[];
}): DerMonitoringSample {
    const aggregatedInverterMetrics = getAggregatedInverterMetrics(inverters);

    return {
        date: new Date(),
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
    };
}
