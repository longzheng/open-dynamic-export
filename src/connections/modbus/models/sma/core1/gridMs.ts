import { modbusModelFactory } from '../../../modbusModelFactory.js';
import {
    registersToInt32,
    registersToInt32Nullable,
    registersToUint32,
    registersToUint32Nullable,
} from '../../../helpers/converters.js';

export type SmaCore1GridMsModels = SmaCore1GridMs1 &
    SmaCore1GridMs2 &
    SmaCore1GridMs3;

type SmaCore1GridMs1 = {
    // Power
    TotW: number;
    // Power L1
    W_phsA: number | null;
    // Power L2
    W_phsB: number | null;
    // Power L3
    W_phsC: number | null;
    // Grid voltage phase L1
    PhV_phsA: number | null;
    // Grid voltage phase L2
    PhV_phsB: number | null;
    // Grid voltage phase L3
    PhV_phsC: number | null;
    // Grid voltage phase L1 against L2
    PhV_phsA2B: number | null;
    // Grid voltage phase L2 against L3
    PhV_phsB2C: number | null;
    // Grid voltage phase L3 against L1
    PhV_phsC2A: number | null;
    // Grid current
    TotA: number;
};

type SmaCore1GridMs2 = {
    // Grid frequency
    Hz: number;
};

type SmaCore1GridMs3 = {
    // Reactive power L1
    VAr_phsA: number | null;
    // Reactive power L2
    VAr_phsB: number | null;
    // Reactive power L3
    VAr_phsC: number | null;
    // Apparent power
    TotVA: number;
    // Apparent power L1
    VA_phsA: number | null;
    // Apparent power L2
    VA_phsB: number | null;
    // Apparent power L3
    VA_phsC: number | null;
};

export const SmaCore1GridMs1Model = modbusModelFactory<SmaCore1GridMs1>({
    name: 'SmaCore1GridMs1Model',
    mapping: {
        TotW: {
            start: 0,
            end: 2,
            readConverter: registersToInt32,
        },
        W_phsA: {
            start: 2,
            end: 4,
            readConverter: registersToInt32Nullable,
        },
        W_phsB: {
            start: 4,
            end: 6,
            readConverter: registersToInt32Nullable,
        },
        W_phsC: {
            start: 6,
            end: 8,
            readConverter: registersToInt32Nullable,
        },
        PhV_phsA: {
            start: 8,
            end: 10,
            readConverter: (value) => registersToUint32Nullable(value, -2),
        },
        PhV_phsB: {
            start: 10,
            end: 12,
            readConverter: (value) => registersToUint32Nullable(value, -2),
        },
        PhV_phsC: {
            start: 12,
            end: 14,
            readConverter: (value) => registersToUint32Nullable(value, -2),
        },
        PhV_phsA2B: {
            start: 14,
            end: 16,
            readConverter: (value) => registersToUint32Nullable(value, -2),
        },
        PhV_phsB2C: {
            start: 16,
            end: 18,
            readConverter: (value) => registersToUint32Nullable(value, -2),
        },
        PhV_phsC2A: {
            start: 18,
            end: 20,
            readConverter: (value) => registersToUint32Nullable(value, -2),
        },
        TotA: {
            start: 20,
            end: 22,
            readConverter: (value) => registersToUint32(value, -3),
        },
    },
});

export const SmaCore1GridMs2Model = modbusModelFactory<SmaCore1GridMs2>({
    name: 'SmaCore1GridMs2Model',
    mapping: {
        Hz: {
            start: 0,
            end: 2,
            readConverter: (value) => registersToUint32(value, -2),
        },
    },
});

export const SmaCore1GridMs3Model = modbusModelFactory<SmaCore1GridMs3>({
    name: 'SmaCore1GridMs3Model',
    mapping: {
        VAr_phsA: {
            start: 0,
            end: 2,
            readConverter: registersToInt32Nullable,
        },
        VAr_phsB: {
            start: 2,
            end: 4,
            readConverter: registersToInt32Nullable,
        },
        VAr_phsC: {
            start: 4,
            end: 6,
            readConverter: registersToInt32Nullable,
        },
        TotVA: {
            start: 6,
            end: 8,
            readConverter: registersToInt32,
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
    },
});
