import {
    registersToUint16,
    registersToInt16,
    registersToSunssf,
    registersToUint32,
    registersToUint64,
    registersToString,
    registersToId,
} from '../helpers/converters';
import { sunSpecModelFactory } from './sunSpecModelFactory';

export type DerAcMeasurementModel = {
    // Model identifier
    ID: 701;
    // Model length
    L: number;
    // AC wiring type. Enumerated value.
    ACType: ACType;
    // Operating state of the DER. Enumerated value.
    St: St;
    // Inverter state. Enumerated value.
    InvSt: InvSt;
    // Grid connection state of the DER. Enumerated value.
    ConnSt: ConnSt;
    // Active alarms for the DER. Bitfield32.
    Alrm: Alrm;
    // DER operational characteristics. Bitfield32.
    DERMode: DERMode;
    // Total active power.
    W: number;
    // Total apparent power.
    VA: number;
    // Total reactive power.
    Var: number;
    // Power factor.
    PF: number;
    // Total AC current.
    A: number;
    // Line to line AC voltage as an average of active phases.
    LLV: number;
    // Line to neutral AC voltage as an average of active phases.
    LNV: number;
    // AC frequency.
    Hz: number;
    // Total active energy injected (Quadrants 1 & 4).
    TotWhInj: bigint;
    // Total active energy absorbed (Quadrants 2 & 3).
    TotWhAbs: bigint;
    // Total reactive energy injected (Quadrants 1 & 2).
    TotVarhInj: bigint;
    // Total reactive energy absorbed (Quadrants 3 & 4).
    TotVarhAbs: bigint;
    // Ambient temperature.
    TmpAmb: number;
    // Cabinet temperature.
    TmpCab: number;
    // Heat sink temperature.
    TmpSnk: number;
    // Transformer temperature.
    TmpTrns: number;
    // IGBT/MOSFET temperature.
    TmpSw: number;
    // Other temperature.
    TmpOt: number;
    // Active power L1.
    WL1: number;
    // Apparent power L1.
    VAL1: number;
    // Reactive power L1.
    VarL1: number;
    // Power factor phase L1.
    PFL1: number;
    // Current phase L1.
    AL1: number;
    // Phase voltage L1-L2.
    VL1L2: number;
    // Phase voltage L1-N.
    VL1: number;
    // Total energy injected L1.
    TotWhInjL1: bigint;
    // Total energy absorbed L1.
    TotWhAbsL1: bigint;
    // Total reactive energy injected L1.
    TotVarhInjL1: bigint;
    // Total reactive energy absorbed L1.
    TotVarhAbsL1: bigint;
    // Active power L2.
    WL2: number;
    // Apparent power L2.
    VAL2: number;
    // Reactive power L2.
    VarL2: number;
    // Power factor phase L2.
    PFL2: number;
    // Current phase L2.
    AL2: number;
    // Phase voltage L2-L3.
    VL2L3: number;
    // Phase voltage L2-N.
    VL2: number;
    // Total energy injected L2.
    TotWhInjL2: bigint;
    // Total energy absorbed L2.
    TotWhAbsL2: bigint;
    // Total reactive energy injected L2.
    TotVarhInjL2: bigint;
    // Total reactive energy absorbed L2.
    TotVarhAbsL2: bigint;
    // Active power L3.
    WL3: number;
    // Apparent power L3.
    VAL3: number;
    // Reactive power L3.
    VarL3: number;
    // Power factor phase L3.
    PFL3: number;
    // Current phase L3.
    AL3: number;
    // Phase voltage L3-L1.
    VL3L1: number;
    // Phase voltage L3-N.
    VL3: number;
    // Total energy injected L3.
    TotWhInjL3: bigint;
    // Total energy absorbed L3.
    TotWhAbsL3: bigint;
    // Total reactive energy injected L3.
    TotVarhInjL3: bigint;
    // Total reactive energy absorbed L3.
    TotVarhAbsL3: bigint;
    // Throttling in percent of maximum active power.
    ThrotPct: number;
    // Active throttling source. Bitfield32.
    ThrotSrc: ThrotSrc;
    // Current scale factor.
    A_SF: number;
    // Voltage scale factor.
    V_SF: number;
    // Frequency scale factor.
    Hz_SF: number;
    // Active power scale factor.
    W_SF: number;
    // Power factor scale factor.
    PF_SF: number;
    // Apparent power scale factor.
    VA_SF: number;
    // Reactive power scale factor.
    Var_SF: number;
    // Active energy scale factor.
    TotWh_SF: number;
    // Reactive energy scale factor.
    TotVarh_SF: number;
    // Temperature scale factor.
    Tmp_SF: number;
    // Manufacturer alarm information. Valid if MANUFACTURER_ALRM indication is active.
    MnAlrmInfo: string;
};

export const derAcMeasurementModel = sunSpecModelFactory<DerAcMeasurementModel>(
    {
        name: 'DER AC Measurement',
        mapping: {
            ID: {
                start: 0,
                end: 1,
                readConverter: (value) => registersToId(value, 701),
            },
            L: { start: 1, end: 2, readConverter: registersToUint16 },
            ACType: { start: 2, end: 3, readConverter: registersToUint16 },
            St: { start: 3, end: 4, readConverter: registersToUint16 },
            InvSt: { start: 4, end: 5, readConverter: registersToUint16 },
            ConnSt: { start: 5, end: 6, readConverter: registersToUint16 },
            Alrm: { start: 6, end: 8, readConverter: registersToUint32 },
            DERMode: { start: 8, end: 10, readConverter: registersToUint32 },
            W: { start: 10, end: 11, readConverter: registersToInt16 },
            VA: { start: 11, end: 12, readConverter: registersToInt16 },
            Var: { start: 12, end: 13, readConverter: registersToInt16 },
            PF: { start: 13, end: 14, readConverter: registersToInt16 },
            A: { start: 14, end: 15, readConverter: registersToInt16 },
            LLV: { start: 15, end: 16, readConverter: registersToUint16 },
            LNV: { start: 16, end: 17, readConverter: registersToUint16 },
            Hz: { start: 17, end: 18, readConverter: registersToUint32 },
            TotWhInj: { start: 19, end: 21, readConverter: registersToUint64 },
            TotWhAbs: { start: 23, end: 25, readConverter: registersToUint64 },
            TotVarhInj: {
                start: 27,
                end: 29,
                readConverter: registersToUint64,
            },
            TotVarhAbs: {
                start: 31,
                end: 33,
                readConverter: registersToUint64,
            },
            TmpAmb: { start: 35, end: 36, readConverter: registersToInt16 },
            TmpCab: { start: 36, end: 37, readConverter: registersToInt16 },
            TmpSnk: { start: 37, end: 38, readConverter: registersToInt16 },
            TmpTrns: { start: 38, end: 39, readConverter: registersToInt16 },
            TmpSw: { start: 39, end: 40, readConverter: registersToInt16 },
            TmpOt: { start: 40, end: 41, readConverter: registersToInt16 },
            WL1: { start: 41, end: 42, readConverter: registersToInt16 },
            VAL1: { start: 42, end: 43, readConverter: registersToInt16 },
            VarL1: { start: 43, end: 44, readConverter: registersToInt16 },
            PFL1: { start: 44, end: 45, readConverter: registersToInt16 },
            AL1: { start: 45, end: 46, readConverter: registersToInt16 },
            VL1L2: { start: 46, end: 47, readConverter: registersToUint16 },
            VL1: { start: 47, end: 48, readConverter: registersToUint16 },
            TotWhInjL1: {
                start: 48,
                end: 50,
                readConverter: registersToUint64,
            },
            TotWhAbsL1: {
                start: 52,
                end: 54,
                readConverter: registersToUint64,
            },
            TotVarhInjL1: {
                start: 56,
                end: 58,
                readConverter: registersToUint64,
            },
            TotVarhAbsL1: {
                start: 60,
                end: 62,
                readConverter: registersToUint64,
            },
            WL2: { start: 64, end: 65, readConverter: registersToInt16 },
            VAL2: { start: 65, end: 66, readConverter: registersToInt16 },
            VarL2: { start: 66, end: 67, readConverter: registersToInt16 },
            PFL2: { start: 67, end: 68, readConverter: registersToInt16 },
            AL2: { start: 68, end: 69, readConverter: registersToInt16 },
            VL2L3: { start: 69, end: 70, readConverter: registersToUint16 },
            VL2: { start: 70, end: 71, readConverter: registersToUint16 },
            TotWhInjL2: {
                start: 71,
                end: 73,
                readConverter: registersToUint64,
            },
            TotWhAbsL2: {
                start: 75,
                end: 77,
                readConverter: registersToUint64,
            },
            TotVarhInjL2: {
                start: 79,
                end: 81,
                readConverter: registersToUint64,
            },
            TotVarhAbsL2: {
                start: 83,
                end: 85,
                readConverter: registersToUint64,
            },
            WL3: { start: 87, end: 88, readConverter: registersToInt16 },
            VAL3: { start: 88, end: 89, readConverter: registersToInt16 },
            VarL3: { start: 89, end: 90, readConverter: registersToInt16 },
            PFL3: { start: 90, end: 91, readConverter: registersToInt16 },
            AL3: { start: 91, end: 92, readConverter: registersToInt16 },
            VL3L1: { start: 92, end: 93, readConverter: registersToUint16 },
            VL3: { start: 93, end: 94, readConverter: registersToUint16 },
            TotWhInjL3: {
                start: 94,
                end: 96,
                readConverter: registersToUint64,
            },
            TotWhAbsL3: {
                start: 98,
                end: 100,
                readConverter: registersToUint64,
            },
            TotVarhInjL3: {
                start: 102,
                end: 104,
                readConverter: registersToUint64,
            },
            TotVarhAbsL3: {
                start: 106,
                end: 108,
                readConverter: registersToUint64,
            },
            ThrotPct: {
                start: 110,
                end: 111,
                readConverter: registersToUint16,
            },
            ThrotSrc: {
                start: 111,
                end: 113,
                readConverter: registersToUint32,
            },
            A_SF: { start: 113, end: 114, readConverter: registersToSunssf },
            V_SF: { start: 114, end: 115, readConverter: registersToSunssf },
            Hz_SF: { start: 115, end: 116, readConverter: registersToSunssf },
            W_SF: { start: 116, end: 117, readConverter: registersToSunssf },
            PF_SF: { start: 117, end: 118, readConverter: registersToSunssf },
            VA_SF: { start: 118, end: 119, readConverter: registersToSunssf },
            Var_SF: { start: 119, end: 120, readConverter: registersToSunssf },
            TotWh_SF: {
                start: 120,
                end: 121,
                readConverter: registersToSunssf,
            },
            TotVarh_SF: {
                start: 121,
                end: 122,
                readConverter: registersToSunssf,
            },
            Tmp_SF: { start: 122, end: 123, readConverter: registersToSunssf },
            MnAlrmInfo: {
                start: 123,
                end: 155,
                readConverter: registersToString,
            },
        },
    },
);

// Enums and bitwise enums for various model fields
export enum ACType {
    SINGLE_PHASE = 0,
    SPLIT_PHASE = 1,
    THREE_PHASE = 2,
}

export enum St {
    OFF = 0,
    ON = 1,
}

export enum InvSt {
    OFF = 0,
    SLEEPING = 1,
    STARTING = 2,
    RUNNING = 3,
    THROTTLED = 4,
    SHUTTING_DOWN = 5,
    FAULT = 6,
    STANDBY = 7,
}

export enum ConnSt {
    DISCONNECTED = 0,
    CONNECTED = 1,
}

// Bitwise enum for alarms (bitfield32)
export enum Alrm {
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
    MANUFACTURER_ALRM = 1 << 16,
}

// Bitwise enum for DER operational characteristics (bitfield32)
export enum DERMode {
    GRID_FOLLOWING = 1 << 0,
    GRID_FORMING = 1 << 1,
    PV_CLIPPED = 1 << 2,
}

// Bitwise enum for throttle sources (bitfield32)
export enum ThrotSrc {
    MAX_W = 1 << 0,
    FIXED_W = 1 << 1,
    FIXED_VAR = 1 << 2,
    FIXED_PF = 1 << 3,
    VOLT_VAR = 1 << 4,
    FREQ_WATT = 1 << 5,
    DYN_REACT_CURR = 1 << 6,
    LVRT = 1 << 7,
    HVRT = 1 << 8,
    WATT_VAR = 1 << 9,
    VOLT_WATT = 1 << 10,
    SCHEDULED = 1 << 11,
    LFRT = 1 << 12,
    HFRT = 1 << 13,
    DERATED = 1 << 14,
}
