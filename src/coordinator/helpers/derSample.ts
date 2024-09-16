import type {
    NoPhaseMeasurement,
    PerPhaseMeasurement,
    PerPhaseNetMeasurement,
} from '../../helpers/measurement.js';
import { assertNonNull } from '../../helpers/null.js';
import {
    averageNumbersArray,
    averageNumbersNullableArray,
    sumNumbersArray,
} from '../../helpers/number.js';
import { getInverterMetrics } from '../../sunspec/helpers/inverterMetrics.js';
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
    const inverterMetrics = inverters.map(getInverterMetrics);

    return {
        date: new Date(),
        realPower: {
            type: 'noPhase',
            value: sumNumbersArray(inverterMetrics.map((metrics) => metrics.W)),
        },
        reactivePower: {
            type: 'noPhase',
            value: sumNumbersArray(
                inverterMetrics.map((metrics) => metrics.VAr ?? 0),
            ),
        },
        voltage: {
            type: 'perPhase',
            phaseA: assertNonNull(
                averageNumbersNullableArray(
                    inverterMetrics.map((metrics) => metrics.PhVphA),
                ),
            ),
            phaseB: averageNumbersNullableArray(
                inverterMetrics.map((metrics) => metrics.PhVphB),
            ),
            phaseC: averageNumbersNullableArray(
                inverterMetrics.map((metrics) => metrics.PhVphC),
            ),
        },
        frequency: averageNumbersArray(
            inverterMetrics.map((metrics) => metrics.Hz),
        ),
    };
}
