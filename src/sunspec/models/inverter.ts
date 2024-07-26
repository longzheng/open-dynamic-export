import {
    registersToUint16,
    registersToSunssf,
    registersToInt16,
    registersToAcc32,
    registersToUint32,
    registersToUint16Nullable,
    registersToInt16Nullable,
    registersToSunssfNullable,
    registersToUint32Nullable,
} from '../helpers/converters';
import type { SunSpecBrand } from '../brand';
import { sunSpecModelFactory } from './sunSpecModelFactory';

// https://sunspec.org/wp-content/uploads/2021/12/SunSpec_Information_Model_Reference_20211209.xlsx
export type InverterModel = {
    // Model identifier
    // Well-known value. Uniquely identifies this as a sunspec model inverter monitoring
    // 101 is single phase, 102 is split phase, 103 is three phase
    ID: number;
    // Model length
    L: number;
    // AC Current
    A: number;
    // Phase A Current
    AphA: number;
    // Phase B Current
    AphB: number | null;
    // Phase C Current
    AphC: number | null;
    A_SF: number;
    // Phase Voltage AB
    PPVphAB: number | null;
    // Phase Voltage BC
    PPVphBC: number | null;
    // Phase Voltage CA
    PPVphCA: number | null;
    // Phase Voltage AN
    PhVphA: number;
    // Phase Voltage BN
    PhVphB: number | null;
    // Phase Voltage CN
    PhVphC: number | null;
    V_SF: number;
    // AC Power
    W: number;
    W_SF: number;
    // Line Frequency
    Hz: number;
    Hz_SF: number;
    // AC Apparent Power
    VA: number | null;
    VA_SF: number | null;
    // AC Reactive Power
    VAr: number | null;
    VAr_SF: number | null;
    // AC Power Factor
    PF: number | null;
    PF_SF: number | null;
    // AC Energy
    WH: number;
    WH_SF: number;
    // DC Amps
    DCA: number | null;
    DCA_SF: number | null;
    // DC Voltage
    DCV: number | null;
    DCV_SF: number | null;
    // DC Power
    DCW: number | null;
    DCW_SF: number | null;
    // Cabinet Temperature
    TmpCab: number;
    // Heat Sink Temperature
    TmpSnk: number | null;
    // Transformer Temperature
    TmpTrns: number | null;
    // Other Temperature
    TmpOt: number | null;
    Tmp_SF: number;
    // Operating State
    St: InverterState;
    // Vendor Operating State
    StVnd: number | null;
    // Event1
    Evt1: InverterEvent1;
    // Event Bitfield 2
    Evt2: number;
    // Vendor Event Bitfield 1
    EvtVnd1: number | null;
    // Vendor Event Bitfield 2
    EvtVnd2: number | null;
    // Vendor Event Bitfield 3
    EvtVnd3: number | null;
    // Vendor Event Bitfield 4
    EvtVnd4: number | null;
};

export const inverterModel = sunSpecModelFactory<InverterModel>({
    mapping: {
        ID: {
            start: 0,
            end: 1,
            readConverter: registersToUint16,
        },
        L: {
            start: 1,
            end: 2,
            readConverter: registersToUint16,
        },
        A: {
            start: 2,
            end: 3,
            readConverter: registersToUint16,
        },
        AphA: {
            start: 3,
            end: 4,
            readConverter: registersToUint16,
        },
        AphB: {
            start: 4,
            end: 5,
            readConverter: registersToUint16Nullable,
        },
        AphC: {
            start: 5,
            end: 6,
            readConverter: registersToUint16Nullable,
        },
        A_SF: {
            start: 6,
            end: 7,
            readConverter: registersToSunssf,
        },
        PPVphAB: {
            start: 7,
            end: 8,
            readConverter: registersToUint16Nullable,
        },
        PPVphBC: {
            start: 8,
            end: 9,
            readConverter: registersToUint16Nullable,
        },
        PPVphCA: {
            start: 9,
            end: 10,
            readConverter: registersToUint16Nullable,
        },
        PhVphA: {
            start: 10,
            end: 11,
            readConverter: registersToUint16,
        },
        PhVphB: {
            start: 11,
            end: 12,
            readConverter: registersToUint16Nullable,
        },
        PhVphC: {
            start: 12,
            end: 13,
            readConverter: registersToUint16Nullable,
        },
        V_SF: {
            start: 13,
            end: 14,
            readConverter: registersToSunssf,
        },
        W: {
            start: 14,
            end: 15,
            readConverter: registersToInt16,
        },
        W_SF: {
            start: 15,
            end: 16,
            readConverter: registersToSunssf,
        },
        Hz: {
            start: 16,
            end: 17,
            readConverter: registersToUint16,
        },
        Hz_SF: {
            start: 17,
            end: 18,
            readConverter: registersToSunssf,
        },
        VA: {
            start: 18,
            end: 19,
            readConverter: registersToInt16Nullable,
        },
        VA_SF: {
            start: 19,
            end: 20,
            readConverter: registersToSunssfNullable,
        },
        VAr: {
            start: 20,
            end: 21,
            readConverter: registersToInt16Nullable,
        },
        VAr_SF: {
            start: 21,
            end: 22,
            readConverter: registersToSunssfNullable,
        },
        PF: {
            start: 22,
            end: 23,
            readConverter: registersToInt16Nullable,
        },
        PF_SF: {
            start: 23,
            end: 24,
            readConverter: registersToSunssfNullable,
        },
        WH: {
            start: 24,
            end: 26,
            readConverter: registersToAcc32,
        },
        WH_SF: {
            start: 26,
            end: 27,
            readConverter: registersToSunssf,
        },
        DCA: {
            start: 27,
            end: 28,
            readConverter: registersToUint16Nullable,
        },
        DCA_SF: {
            start: 28,
            end: 29,
            readConverter: registersToSunssfNullable,
        },
        DCV: {
            start: 29,
            end: 30,
            readConverter: registersToUint16Nullable,
        },
        DCV_SF: {
            start: 30,
            end: 31,
            readConverter: registersToSunssfNullable,
        },
        DCW: {
            start: 31,
            end: 32,
            readConverter: registersToInt16Nullable,
        },
        DCW_SF: {
            start: 32,
            end: 33,
            readConverter: registersToSunssfNullable,
        },
        TmpCab: {
            start: 33,
            end: 34,
            readConverter: registersToInt16,
        },
        TmpSnk: {
            start: 34,
            end: 35,
            readConverter: registersToInt16Nullable,
        },
        TmpTrns: {
            start: 35,
            end: 36,
            readConverter: registersToInt16Nullable,
        },
        TmpOt: {
            start: 36,
            end: 37,
            readConverter: registersToInt16Nullable,
        },
        Tmp_SF: {
            start: 37,
            end: 38,
            readConverter: registersToSunssf,
        },
        St: {
            start: 38,
            end: 39,
            readConverter: registersToUint16,
        },
        StVnd: {
            start: 39,
            end: 40,
            readConverter: registersToUint16Nullable,
        },
        Evt1: {
            start: 40,
            end: 42,
            readConverter: registersToUint32,
        },
        Evt2: {
            start: 42,
            end: 44,
            readConverter: registersToUint32,
        },
        EvtVnd1: {
            start: 44,
            end: 46,
            readConverter: registersToUint32Nullable,
        },
        EvtVnd2: {
            start: 46,
            end: 48,
            readConverter: registersToUint32Nullable,
        },
        EvtVnd3: {
            start: 48,
            end: 50,
            readConverter: registersToUint32Nullable,
        },
        EvtVnd4: {
            start: 50,
            end: 52,
            readConverter: registersToUint32Nullable,
        },
    },
});

export function inverterModelAddressStartByBrand(brand: SunSpecBrand) {
    switch (brand) {
        case 'fronius':
            return 40069;
        case 'sma':
            throw new Error('Not implemented');
        case 'solaredge':
            throw new Error('Not implemented');
    }
}

export enum InverterState {
    // Off
    I_STATUS_OFF = 1,
    // Sleeping (auto-shutdown)
    I_STATUS_SLEEPING = 2,
    // Starting up
    I_STATUS_STARTING = 3,
    // Tracking power point
    I_STATUS_MPPT = 4,
    // Forced power reduction
    I_STATUS_THROTTLED = 5,
    // Shutting down
    I_STATUS_SHUTTING_DOWN = 6,
    // One or more faults exist
    I_STATUS_FAULT = 7,
    // Standby (service on unit)* might be in Events
    I_STATUS_STANDBY = 8,
}

// SunSpec_Information_Model_Reference_20210302.xlsx
export enum InverterEvent1 {
    NONE = 0,
    GROUND_FAULT = 1 << 0,
    DC_OVER_VOLT = 1 << 1,
    AC_DISCONNECT = 1 << 2,
    DC_DISCONNECT = 1 << 3,
    GRID_DISCONNECT = 1 << 4,
    CABINET_OPEN = 1 << 5,
    MANUAL_SHUTDOWN = 1 << 6,
    OVER_TEMP = 1 << 7,
    OVER_FREQUENCY = 1 << 8,
    UNDER_FREQUENCY = 1 << 9,
    AC_OVER_VOLT = 1 << 10,
    AC_UNDER_VOLT = 1 << 11,
    BLOWN_STRING_FUSE = 1 << 12,
    UNDER_TEMP = 1 << 13,
    MEMORY_LOSS = 1 << 14,
    HW_TEST_FAILURE = 1 << 15,
}
