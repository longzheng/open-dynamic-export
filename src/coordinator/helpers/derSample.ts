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
    // Battery aggregated data across all inverters with storage
    battery: z
        .object({
            // Average state of charge across all batteries
            averageSocPercent: z.number().nullable(),
            // Total available energy across all batteries
            totalAvailableEnergyWh: z.number().nullable(),
            // Total max charge rate across all batteries
            totalMaxChargeRateWatts: z.number(),
            // Total max discharge rate across all batteries
            totalMaxDischargeRateWatts: z.number(),
            // Number of inverters with battery storage
            batteryCount: z.number(),
        })
        .nullable(),
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
