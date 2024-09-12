import { modbusModelFactory } from '../../../modbus/modbusModelFactory.js';
import {
    registersToUint16,
    registersToUint32,
    registersToUint32Nullable,
} from '../../../sunspec/helpers/converters.js';

export type SmaMeteringModel = {
    // Grid power phase L1
    PhV_phsA: number;
    // Grid power phase L2
    PhV_phsB: number | null;
    // Grid power phase L3
    PhV_phsC: number | null;
    // Power grid feeding L1
    W_phsA: number;
    // Power grid feeding L2
    W_phsB: number | null;
    // Power grid feeding L3
    W_phsC: number | null;
    // Power drawn from grid phase L1
    WIn_phsA: number;
    // Power drawn from grid phase L2
    WIn_phsB: number | null;
    // Power drawn from grid phase L3
    WIn_phsC: number | null;
    // Reactive power grid feeding phase L1
    VAr_phsA: number;
    // Reactive power grid feeding phase L2
    VAr_phsB: number | null;
    // Reactive power grid feeding phase L3
    VAr_phsC: number | null;
    // Reactive power grid feeding
    TotVAr: number;
    // Displacement power factor
    TotPF: number;
    // Grid current phase L1
    A_phsA: number;
    // 	Grid current phase L2
    A_phsB: number | null;
    // Grid current phase L3
    A_phsC: number | null;
    // Apparent power L1
    VA_phsA: number;
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
    // EEI displacement power factor
    TotPFEEI: number;
};

export const meterModel = modbusModelFactory<SmaMeteringModel>({
    name: 'smaMetering',
    mapping: {
        PhV_phsA: {
            start: 0,
            end: 2,
            readConverter: registersToUint32,
        },
        PhV_phsB: {
            start: 2,
            end: 4,
            readConverter: registersToUint32Nullable,
        },
        PhV_phsC: {
            start: 4,
            end: 6,
            readConverter: registersToUint32Nullable,
        },
        W_phsA: {
            start: 6,
            end: 8,
            readConverter: registersToUint32,
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
            readConverter: registersToUint32,
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
            readConverter: registersToUint32,
        },
        VAr_phsB: {
            start: 20,
            end: 22,
            readConverter: registersToUint32Nullable,
        },
        VAr_phsC: {
            start: 22,
            end: 24,
            readConverter: registersToUint32Nullable,
        },
    },
});
