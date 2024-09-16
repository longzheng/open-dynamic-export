import type {
    NoPhaseMeasurement,
    PerPhaseMeasurement,
    PerPhaseNetMeasurement,
} from '../../helpers/measurement.js';
import {
    averageNumbersArray,
    averageNumbersNullableArray,
    sumNumbersArray,
} from '../../helpers/number.js';
import type { InverterData } from './inverterData.js';
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
    invertersData,
}: {
    invertersData: Pick<InverterData, 'inverter'>[];
}): DerSample {
    return {
        date: new Date(),
        realPower: {
            type: 'noPhase',
            value: sumNumbersArray(
                invertersData.map((data) => data.inverter.realPower),
            ),
        },
        reactivePower: {
            type: 'noPhase',
            value: sumNumbersArray(
                invertersData.map((data) => data.inverter.reactivePower),
            ),
        },
        voltage: {
            type: 'perPhase',
            phaseA: averageNumbersArray(
                invertersData.map((data) => data.inverter.voltagePhaseA),
            ),
            phaseB: averageNumbersNullableArray(
                invertersData.map((data) => data.inverter.voltagePhaseB),
            ),
            phaseC: averageNumbersNullableArray(
                invertersData.map((data) => data.inverter.voltagePhaseC),
            ),
        },
        frequency: averageNumbersArray(
            invertersData.map((data) => data.inverter.frequency),
        ),
    };
}
