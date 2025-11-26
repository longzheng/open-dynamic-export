import { z } from 'zod';
import { DERTyp } from '../connections/sunspec/models/nameplate.js';
import { connectStatusValueSchema } from '../sep2/models/connectStatus.js';
import { OperationalModeStatusValue } from '../sep2/models/operationModeStatus.js';
import { type SampleBase } from '../coordinator/helpers/sampleBase.js';
import { ChaSt, ChaGriSet } from '../connections/sunspec/models/storage.js';

export const inverterDataSchema = z.object({
    inverter: z.object({
        /**
         * Positive values = inverter export (produce) power
         *
         * Negative values = inverter import (consume) power
         *
         * Value is total (net across all phases) measurement
         */
        realPower: z.number(),
        reactivePower: z.number(),
        voltagePhaseA: z.number().nullable(),
        voltagePhaseB: z.number().nullable(),
        voltagePhaseC: z.number().nullable(),
        frequency: z.number(),
    }),
    nameplate: z.object({
        type: z.nativeEnum(DERTyp),
        maxW: z.number(),
        maxVA: z.number(),
        maxVar: z.number(),
    }),
    settings: z.object({
        maxW: z.number(),
        maxVA: z.number().nullable(),
        maxVar: z.number().nullable(),
    }),
    status: z.object({
        operationalModeStatus: z.nativeEnum(OperationalModeStatusValue),
        genConnectStatus: connectStatusValueSchema,
    }),
    storage: z
        .object({
            // Battery capacity and state
            stateOfChargePercent: z.number().nullable(),
            availableEnergyWh: z.number().nullable(),
            batteryVoltage: z.number().nullable(),
            chargeStatus: z.nativeEnum(ChaSt).nullable(),
            // Charge/discharge rates and limits
            maxChargeRateWatts: z.number(),
            maxDischargeRateWatts: z.number(),
            currentChargeRatePercent: z.number().nullable(),
            currentDischargeRatePercent: z.number().nullable(),
            // Control settings
            minReservePercent: z.number().nullable(),
            gridChargingPermitted: z.nativeEnum(ChaGriSet).nullable(),
        })
        .optional(),
});

export type InverterDataBase = z.infer<typeof inverterDataSchema>;

export type InverterData = SampleBase & InverterDataBase;
