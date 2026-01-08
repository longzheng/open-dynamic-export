import { z } from 'zod';
import {
    noPhaseMeasurementSchema,
    perPhaseMeasurementSchema,
    perPhaseNetMeasurementSchema,
} from '../../helpers/measurement.js';
import {
    averageNumbersNullableArray,
    sumNumbersArray,
    sumNumbersNullableArray,
} from '../../helpers/number.js';
import { type InverterData } from '../../inverter/inverterData.js';
import { type SampleBase } from './sampleBase.js';
import { DERType } from '../../sep2/models/derType.js';
import { OperationalModeStatusValue } from '../../sep2/models/operationModeStatus.js';
import { type ConnectStatusValue } from '../../sep2/models/connectStatus.js';

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
    nameplate: z.object({
        type: z.number(),
        maxW: z.number(),
        maxVA: z.number(),
        maxVar: z.number(),
    }),
    settings: z.object({
        setMaxW: z.number(),
        setMaxVA: z.number().nullable(),
        setMaxVar: z.number().nullable(),
    }),
    status: z.object({
        operationalModeStatus: z.number(),
        genConnectStatus: z.number(),
    }),
    invertersCount: z.number(),
});

export type DerSampleData = z.infer<typeof derSampleDataSchema>;

export type DerSample = SampleBase & DerSampleData;

export function generateDerSample({
    invertersData,
}: {
    invertersData: InverterData[];
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
            phaseA: averageNumbersNullableArray(
                invertersData
                    .map((data) => data.inverter.voltagePhaseA)
                    .filter((number) => number !== null && number > 0),
            ),
            phaseB: averageNumbersNullableArray(
                invertersData
                    .map((data) => data.inverter.voltagePhaseB)
                    .filter((number) => number !== null && number > 0),
            ),
            phaseC: averageNumbersNullableArray(
                invertersData
                    .map((data) => data.inverter.voltagePhaseC)
                    .filter((number) => number !== null && number > 0),
            ),
        },
        frequency: averageNumbersNullableArray(
            invertersData
                .map((data) => data.inverter.frequency)
                .filter((number) => number !== null && number > 0),
        ),
        nameplate: {
            type: Math.max(
                ...invertersData.map((data) => data.nameplate.type),
                // fallback to NA if no inverters are connected
                DERType.NotApplicable,
            ) satisfies DERType,
            maxW: sumNumbersArray(
                invertersData.map((data) => data.nameplate.maxVA),
            ),
            maxVA: sumNumbersArray(
                invertersData.map((data) => data.nameplate.maxVA),
            ),
            maxVar: sumNumbersArray(
                invertersData.map((data) => data.nameplate.maxVar),
            ),
        },
        settings: {
            setMaxW: sumNumbersArray(
                invertersData.map((data) => data.settings.maxW),
            ),
            setMaxVA: sumNumbersNullableArray(
                invertersData.map((data) => data.settings.maxVA),
            ),
            setMaxVar: sumNumbersNullableArray(
                invertersData.map((data) => data.settings.maxVar),
            ),
        },
        status: {
            operationalModeStatus: Math.max(
                ...invertersData.map(
                    (data) => data.status.operationalModeStatus,
                    // fallback to Off if no inverters are connected
                    OperationalModeStatusValue.Off,
                ),
            ) satisfies OperationalModeStatusValue,
            genConnectStatus: Math.max(
                ...invertersData.map((data) => data.status.genConnectStatus),
                // fallback to 0 if no inverters are connected
                0,
            ) satisfies ConnectStatusValue,
        },
        invertersCount: invertersData.length,
    };
}
