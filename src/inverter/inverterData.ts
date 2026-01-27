import * as v from 'valibot';
import { DERTyp } from '../connections/sunspec/models/nameplate.js';
import { connectStatusValueSchema } from '../sep2/models/connectStatus.js';
import { OperationalModeStatusValue } from '../sep2/models/operationModeStatus.js';
import type { SampleBase } from '../coordinator/helpers/sampleBase.js';

export const inverterDataSchema = v.object({
    inverter: v.object({
        /**
         * Positive values = inverter export (produce) power
         *
         * Negative values = inverter import (consume) power
         *
         * Value is total (net across all phases) measurement
         */
        realPower: v.number(),
        reactivePower: v.number(),
        voltagePhaseA: v.nullable(v.number()),
        voltagePhaseB: v.nullable(v.number()),
        voltagePhaseC: v.nullable(v.number()),
        frequency: v.number(),
    }),
    nameplate: v.object({
        type: v.enum(DERTyp),
        maxW: v.number(),
        maxVA: v.number(),
        maxVar: v.number(),
    }),
    settings: v.object({
        maxW: v.number(),
        maxVA: v.nullable(v.number()),
        maxVar: v.nullable(v.number()),
    }),
    status: v.object({
        operationalModeStatus: v.enum(OperationalModeStatusValue),
        genConnectStatus: connectStatusValueSchema,
    }),
});

export type InverterDataBase = v.InferOutput<typeof inverterDataSchema>;

export type InverterData = SampleBase & InverterDataBase;
