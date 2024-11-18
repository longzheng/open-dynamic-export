import { modbusModelFactory } from '../../../modbusModelFactory.js';
import {
    registersToInt32,
    registersToInt32Nullable,
    registersToUint32,
    registersToUint32Nullable,
} from '../../../helpers/converters.js';

export type SmaCore1MeteringGridMsModels = SmaCore1MeteringGridMs1 &
    SmaCore1MeteringGridMs2;

type SmaCore1MeteringGridMs1 = {
    // Grid power phase L1
    PhV_phsA: number | null;
    // Grid power phase L2
    PhV_phsB: number | null;
    // Grid power phase L3
    PhV_phsC: number | null;
    // Power grid feeding L1
    W_phsA: number | null;
    // Power grid feeding L2
    W_phsB: number | null;
    // Power grid feeding L3
    W_phsC: number | null;
    // Power drawn from grid phase L1
    WIn_phsA: number | null;
    // Power drawn from grid phase L2
    WIn_phsB: number | null;
    // Power drawn from grid phase L3
    WIn_phsC: number | null;
    // Reactive power grid feeding phase L1
    VAr_phsA: number | null;
    // Reactive power grid feeding phase L2
    VAr_phsB: number | null;
    // Reactive power grid feeding phase L3
    VAr_phsC: number | null;
    // Reactive power grid feeding
    TotVar: number;
};

type SmaCore1MeteringGridMs2 = {
    // Displacement power factor
    TotPF: number;
    // Grid current phase L1
    A_phsA: number | null;
    // 	Grid current phase L2
    A_phsB: number | null;
    // Grid current phase L3
    A_phsC: number | null;
    // Apparent power L1
    VA_phsA: number | null;
    // Apparent power L2
    VA_phsB: number | null;
    // Apparent power L3
    VA_phsC: number | null;
    // Grid frequency
    Hz: number;
    // Grid voltage phase L3 against L1
    PhV_phsC2A: number | null;
    // Grid voltage phase L1 against L2
    PhV_phsA2B: number | null;
    // Grid voltage phase L2 against L3
    PhV_phsB2C: number | null;
    // Apparent power
    TotVA: number;
};

export const SmaCore1MeteringGridMs1Model =
    modbusModelFactory<SmaCore1MeteringGridMs1>({
        name: 'SmaCore1MeteringGridMs1Model',
        mapping: {
            PhV_phsA: {
                start: 0,
                end: 2,
                readConverter: (value) => registersToUint32Nullable(value, -2),
            },
            PhV_phsB: {
                start: 2,
                end: 4,
                readConverter: (value) => registersToUint32Nullable(value, -2),
            },
            PhV_phsC: {
                start: 4,
                end: 6,
                readConverter: (value) => registersToUint32Nullable(value, -2),
            },
            W_phsA: {
                start: 6,
                end: 8,
                readConverter: registersToUint32Nullable,
            },
            W_phsB: {
                start: 8,
                end: 10,
                readConverter: registersToUint32Nullable,
            },
            W_phsC: {
                start: 10,
                end: 12,
                readConverter: registersToUint32Nullable,
            },
            WIn_phsA: {
                start: 12,
                end: 14,
                readConverter: registersToUint32Nullable,
            },
            WIn_phsB: {
                start: 14,
                end: 16,
                readConverter: registersToUint32Nullable,
            },
            WIn_phsC: {
                start: 16,
                end: 18,
                readConverter: registersToUint32Nullable,
            },
            VAr_phsA: {
                start: 18,
                end: 20,
                readConverter: registersToInt32Nullable,
            },
            VAr_phsB: {
                start: 20,
                end: 22,
                readConverter: registersToInt32Nullable,
            },
            VAr_phsC: {
                start: 22,
                end: 24,
                readConverter: registersToInt32Nullable,
            },
            TotVar: {
                start: 24,
                end: 26,
                readConverter: registersToInt32,
            },
        },
    });

export const SmaCore1MeteringGridMs2Model =
    modbusModelFactory<SmaCore1MeteringGridMs2>({
        name: 'SmaCore1MeteringGridMs2Model',
        mapping: {
            TotPF: {
                start: 0,
                end: 2,
                readConverter: (value) => registersToUint32(value, -2),
            },
            A_phsA: {
                start: 2,
                end: 4,
                readConverter: (value) => registersToInt32Nullable(value, -3),
            },
            A_phsB: {
                start: 4,
                end: 6,
                readConverter: (value) => registersToInt32Nullable(value, -3),
            },
            A_phsC: {
                start: 6,
                end: 8,
                readConverter: (value) => registersToInt32Nullable(value, -3),
            },
            VA_phsA: {
                start: 8,
                end: 10,
                readConverter: registersToInt32Nullable,
            },
            VA_phsB: {
                start: 10,
                end: 12,
                readConverter: registersToInt32Nullable,
            },
            VA_phsC: {
                start: 12,
                end: 14,
                readConverter: registersToInt32Nullable,
            },
            Hz: {
                start: 14,
                end: 16,
                readConverter: (value) => registersToUint32(value, -2),
            },
            PhV_phsC2A: {
                start: 16,
                end: 18,
                readConverter: (value) => registersToUint32Nullable(value, -2),
            },
            PhV_phsA2B: {
                start: 18,
                end: 20,
                readConverter: (value) => registersToUint32Nullable(value, -2),
            },
            PhV_phsB2C: {
                start: 20,
                end: 22,
                readConverter: (value) => registersToUint32Nullable(value, -2),
            },
            TotVA: {
                start: 22,
                end: 24,
                readConverter: registersToInt32,
            },
        },
    });
