import { z } from 'zod';
import {
    noPhaseMeasurementSchema,
    perPhaseMeasurementSchema,
    perPhaseNetMeasurementSchema,
} from '../../helpers/measurement.js';
import {
    averageNumbersArray,
    averageNumbersNullableArray,
    sumNumbersArray,
} from '../../helpers/number.js';
import type { InverterData } from '../../inverter/inverterData.js';
import type { SampleBase } from './sampleBase.js';

// aligns with the CSIP-AUS requirements for DER monitoring
export const derSampleDataSchema = z.object({
    realPower: z.union([
        perPhaseNetMeasurementSchema,
        noPhaseMeasurementSchema,
    ]),
    reactivePower: z.union([
        perPhaseNetMeasurementSchema,
        noPhaseMeasurementSchema,
    ]),
    voltage: perPhaseMeasurementSchema.nullable(),
    frequency: z.number().nullable(),
});

export type DerSampleData = z.infer<typeof derSampleDataSchema>;

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
            net: sumNumbersArray(
                invertersData.map((data) => data.inverter.realPower),
            ),
        },
        reactivePower: {
            type: 'noPhase',
            net: sumNumbersArray(
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
