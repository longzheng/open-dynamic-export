import type {
    NoPhaseMeasurement,
    PerPhaseMeasurement,
    PerPhaseNetMeasurement,
} from '../../helpers/measurement.js';
import { assertNonNull } from '../../helpers/null.js';
import { getAggregatedInverterMetrics } from '../../sunspec/helpers/inverterMetrics.js';
import type { InverterModel } from '../../sunspec/models/inverter.js';
import type { SampleBase } from './sampleBase.js';

// aligns with the CSIP-AUS requirements for DER monitoring
export type DerSampleData = {
    realPower: PerPhaseNetMeasurement | NoPhaseMeasurement;
    reactivePower: PerPhaseNetMeasurement | NoPhaseMeasurement;
    voltage: PerPhaseMeasurement | null;
    frequency: number | null;
};

export type DerSample = SampleBase & DerSampleData;

export function generateDerSample({
    inverters,
}: {
    inverters: InverterModel[];
}): DerSample {
    const aggregatedInverterMetrics = getAggregatedInverterMetrics(inverters);

    return {
        date: new Date(),
        realPower: {
            type: 'noPhase',
            value: aggregatedInverterMetrics.W,
        },
        reactivePower: {
            type: 'noPhase',
            value: aggregatedInverterMetrics.VAr ?? 0,
        },
        voltage: {
            type: 'perPhase',
            phaseA: assertNonNull(aggregatedInverterMetrics.PhVphA),
            phaseB: aggregatedInverterMetrics.PhVphB,
            phaseC: aggregatedInverterMetrics.PhVphC,
        },
        frequency: aggregatedInverterMetrics.Hz,
    };
}
