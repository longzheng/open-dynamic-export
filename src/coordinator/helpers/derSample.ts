import * as v from 'valibot';
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
import type { InverterData } from '../../inverter/inverterData.js';
import { DERType } from '../../sep2/models/derType.js';
import {
    OperationalModeStatusValue,
    operationalModeStatusValueSchema,
} from '../../sep2/models/operationModeStatus.js';
import type { ConnectStatusValue } from '../../sep2/models/connectStatus.js';
import type { SampleBase } from './sampleBase.js';

// aligns with the CSIP-AUS requirements for DER monitoring
export const derSampleDataSchema = v.object({
    realPower: v.union([
        perPhaseNetMeasurementSchema,
        noPhaseMeasurementSchema,
    ]),
    reactivePower: v.union([
        perPhaseNetMeasurementSchema,
        noPhaseMeasurementSchema,
    ]),
    voltage: v.nullable(
        v.pipe(
            perPhaseMeasurementSchema,
            v.check(
                ({ phaseA, phaseB, phaseC }) =>
                    (phaseA === null || phaseA >= 0) &&
                    (phaseB === null || phaseB >= 0) &&
                    (phaseC === null || phaseC >= 0),
                'Voltage must be non-negative per phase',
            ),
        ),
    ),
    frequency: v.nullable(v.pipe(v.number(), v.minValue(0))),
    nameplate: v.object({
        type: v.number(),
        maxW: v.number(),
        maxVA: v.number(),
        maxVar: v.number(),
    }),
    settings: v.object({
        setMaxW: v.number(),
        setMaxVA: v.nullable(v.number()),
        setMaxVar: v.nullable(v.number()),
    }),
    status: v.object({
        operationalModeStatus: operationalModeStatusValueSchema,
        genConnectStatus: v.number(),
    }),
    invertersCount: v.pipe(v.number(), v.minValue(0)),
    // Battery aggregated data across all inverters with storage
    battery: v.nullable(
        v.object({
            // Average state of charge across all batteries
            averageSocPercent: v.nullable(v.number()),
            // Total available energy across all batteries
            totalAvailableEnergyWh: v.nullable(v.number()),
            // Total max charge rate across all batteries
            totalMaxChargeRateWatts: v.number(),
            // Total max discharge rate across all batteries
            totalMaxDischargeRateWatts: v.number(),
            // Number of inverters with battery storage
            batteryCount: v.number(),
        }),
    ),
});

export type DerSampleData = v.InferOutput<typeof derSampleDataSchema>;

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
                .filter((number) => number > 0),
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
        battery: (() => {
            const batteriesData = invertersData
                .map((data) => data.storage)
                .filter(
                    (storage): storage is NonNullable<typeof storage> =>
                        storage !== undefined,
                );

            if (batteriesData.length === 0) {
                return null;
            }

            const socValues = batteriesData
                .map((battery) => battery.stateOfChargePercent)
                .filter((soc): soc is NonNullable<typeof soc> => soc !== null);

            return {
                averageSocPercent:
                    socValues.length > 0
                        ? averageNumbersArray(socValues)
                        : null,
                totalAvailableEnergyWh: sumNumbersNullableArray(
                    batteriesData.map((battery) => battery.availableEnergyWh),
                ),
                totalMaxChargeRateWatts: sumNumbersArray(
                    batteriesData.map((battery) => battery.maxChargeRateWatts),
                ),
                totalMaxDischargeRateWatts: sumNumbersArray(
                    batteriesData.map(
                        (battery) => battery.maxDischargeRateWatts,
                    ),
                ),
                batteryCount: batteriesData.length,
            };
        })(),
    };
}
