import {
    registersToUint16,
    registersToSunssf,
    registersToInt16,
    registersToAcc32,
    registersToUint32,
} from '../helpers/converters';
import type { SunSpecBrand } from './brand';
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
    AphB: number;
    // Phase C Current
    AphC: number;
    A_SF: number;
    // Phase Voltage AB
    PPVphAB: number;
    // Phase Voltage BC
    PPVphBC: number;
    // Phase Voltage CA
    PPVphCA: number;
    // Phase Voltage AN
    PhVphA: number;
    // Phase Voltage BN
    PhVphB: number;
    // Phase Voltage CN
    PhVphC: number;
    V_SF: number;
    // AC Power
    W: number;
    W_SF: number;
    // Line Frequency
    Hz: number;
    Hz_SF: number;
    // AC Apparent Power
    VA: number;
    VA_SF: number;
    // AC Reactive Power
    VAr: number;
    VAr_SF: number;
    // AC Power Factor
    PF: number;
    PF_SF: number;
    // AC Energy
    WH: number;
    WH_SF: number;
    // DC Amps
    DCA: number;
    DCA_SF: number;
    // DC Voltage
    DCV: number;
    DCV_SF: number;
    // DC Power
    DCW: number;
    DCW_SF: number;
    // Cabinet Temperature
    TmpCab: number;
    // Heat Sink Temperature
    TmpSnk: number;
    // Transformer Temperature
    TmpTrns: number;
    // Other Temperature
    TmpOt: number;
    Tmp_SF: number;
    // Operating State
    St: InverterState;
    // Vendor Operating State
    StVnd: number;
    // Event1
    Evt1: InverterEvent1;
    // Event Bitfield 2
    Evt2: number;
    // Vendor Event Bitfield 1
    EvtVnd1: number;
    // Vendor Event Bitfield 2
    EvtVnd2: number;
    // Vendor Event Bitfield 3
    EvtVnd3: number;
    // Vendor Event Bitfield 4
    EvtVnd4: number;
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
            readConverter: registersToUint16,
        },
        AphC: {
            start: 5,
            end: 6,
            readConverter: registersToUint16,
        },
        A_SF: {
            start: 6,
            end: 7,
            readConverter: registersToSunssf,
        },
        PPVphAB: {
            start: 7,
            end: 8,
            readConverter: registersToUint16,
        },
        PPVphBC: {
            start: 8,
            end: 9,
            readConverter: registersToUint16,
        },
        PPVphCA: {
            start: 9,
            end: 10,
            readConverter: registersToUint16,
        },
        PhVphA: {
            start: 10,
            end: 11,
            readConverter: registersToUint16,
        },
        PhVphB: {
            start: 11,
            end: 12,
            readConverter: registersToUint16,
        },
        PhVphC: {
            start: 12,
            end: 13,
            readConverter: registersToUint16,
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
            readConverter: registersToInt16,
        },
        VA_SF: {
            start: 19,
            end: 20,
            readConverter: registersToSunssf,
        },
        VAr: {
            start: 20,
            end: 21,
            readConverter: registersToInt16,
        },
        VAr_SF: {
            start: 21,
            end: 22,
            readConverter: registersToSunssf,
        },
        PF: {
            start: 22,
            end: 23,
            readConverter: registersToInt16,
        },
        PF_SF: {
            start: 23,
            end: 24,
            readConverter: registersToSunssf,
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
            readConverter: registersToUint16,
        },
        DCA_SF: {
            start: 28,
            end: 29,
            readConverter: registersToSunssf,
        },
        DCV: {
            start: 29,
            end: 30,
            readConverter: registersToUint16,
        },
        DCV_SF: {
            start: 30,
            end: 31,
            readConverter: registersToSunssf,
        },
        DCW: {
            start: 31,
            end: 32,
            readConverter: registersToInt16,
        },
        DCW_SF: {
            start: 32,
            end: 33,
            readConverter: registersToSunssf,
        },
        TmpCab: {
            start: 33,
            end: 34,
            readConverter: registersToInt16,
        },
        TmpSnk: {
            start: 34,
            end: 35,
            readConverter: registersToInt16,
        },
        TmpTrns: {
            start: 35,
            end: 36,
            readConverter: registersToInt16,
        },
        TmpOt: {
            start: 36,
            end: 37,
            readConverter: registersToInt16,
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
            readConverter: registersToUint16,
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
            readConverter: registersToUint32,
        },
        EvtVnd2: {
            start: 46,
            end: 48,
            readConverter: registersToUint32,
        },
        EvtVnd3: {
            start: 48,
            end: 50,
            readConverter: registersToUint32,
        },
        EvtVnd4: {
            start: 50,
            end: 52,
            readConverter: registersToUint32,
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
// GROUND_FAULT	0
// DC_OVER_VOLT	1
// AC_DISCONNECT	2
// DC_DISCONNECT	3
// GRID_DISCONNECT	4
// CABINET_OPEN	5
// MANUAL_SHUTDOWN	6
// OVER_TEMP	7
// OVER_FREQUENCY	8
// UNDER_FREQUENCY	9
// AC_OVER_VOLT	10
// AC_UNDER_VOLT	11
// BLOWN_STRING_FUSE	12
// UNDER_TEMP	13
// MEMORY_LOSS	14
// HW_TEST_FAILURE	15
export enum InverterEvent1 {
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
