import { z } from 'zod';
import { DERTyp } from '../connections/sunspec/models/nameplate.js';
import { ConnectStatusValue } from '../sep2/models/connectStatus.js';
import { OperationalModeStatusValue } from '../sep2/models/operationModeStatus.js';
import { type SampleBase } from '../coordinator/helpers/sampleBase.js';

export const inverterDataSchema = z.object({
    inverter: z.object({
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
        genConnectStatus: z.nativeEnum(ConnectStatusValue),
    }),
});

export type InverterDataBase = z.infer<typeof inverterDataSchema>;

export type InverterData = SampleBase & InverterDataBase;
