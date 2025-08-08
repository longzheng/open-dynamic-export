import { z } from 'zod';
import { DERTyp } from '../connections/sunspec/models/nameplate.js';
import { connectStatusValueSchema } from '../sep2/models/connectStatus.js';
import { OperationalModeStatusValue } from '../sep2/models/operationModeStatus.js';
import { type SampleBase } from '../coordinator/helpers/sampleBase.js';
import { ChaSt } from '../connections/sunspec/models/storage.js';

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
    storage: z.object({
        capacity: z.number(),        // WChaMax
        maxChargeRate: z.number(),   // WChaGra
        maxDischargeRate: z.number(), // WDisChaGra
        stateOfCharge: z.number().nullable(), // ChaState
        chargeStatus: z.nativeEnum(ChaSt).nullable(), // ChaSt
        storageMode: z.number(),     // StorCtl_Mod
        chargeRate: z.number().nullable(),    // InWRte
        dischargeRate: z.number().nullable(), // OutWRte
    }).optional(),
});

export type InverterDataBase = z.infer<typeof inverterDataSchema>;

export type InverterData = SampleBase & InverterDataBase;
