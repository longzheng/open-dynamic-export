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
    registersToId,
} from '../helpers/converters.js';
import { sunSpecModelFactory } from './sunSpecModelFactory.js';

// generated from SunSpec_Information_Model_Reference_20240701.xlsx

/**
 * Inverter (Single Phase, Split-Phase, Three Phase)
 *
 * A combination of the three models for single phase, split-phase, and three phase inverters
 */
export type InverterModel = {
    /**
     * Model ID
     *
     * Model identifier
     */
    ID: 101 | 102 | 103;

    /**
     * Model Length
     *
     * Model length
     */
    L: number;

    /**
     * AC Current
     *
     * AC Current
     */
    A: number;

    /**
     * Phase A Current
     *
     * Phase A Current
     */
    AphA: number;

    /**
     * Phase B Current
     *
     * Phase B Current
     */
    AphB: number | null;

    /**
     * Phase C Current
     *
     * Phase C Current
     */
    AphC: number | null;

    /**
     * Scale Factor for Current
     */
    A_SF: number;

    /**
     * Phase Voltage AB
     *
     * Phase Voltage AB
     */
    PPVphAB: number | null;

    /**
     * Phase Voltage BC
     *
     * Phase Voltage BC
     */
    PPVphBC: number | null;

    /**
     * Phase Voltage CA
     *
     * Phase Voltage CA
     */
    PPVphCA: number | null;

    /**
     * Phase Voltage AN
     *
     * Phase Voltage AN
     */
    PhVphA: number;

    /**
     * Phase Voltage BN
     *
     * Phase Voltage BN
     */
    PhVphB: number | null;

    /**
     * Phase Voltage CN
     *
     * Phase Voltage CN
     */
    PhVphC: number | null;

    /**
     * Scale Factor for Voltage
     */
    V_SF: number;

    /**
     * AC Power
     *
     * AC Power
     */
    W: number;

    /**
     * Scale Factor for Power
     */
    W_SF: number;

    /**
     * Line Frequency
     *
     * Line Frequency
     */
    Hz: number;

    /**
     * Scale Factor for Frequency
     */
    Hz_SF: number;

    /**
     * AC Apparent Power
     *
     * AC Apparent Power
     */
    VA: number | null;

    /**
     * Scale Factor for Apparent Power
     */
    VA_SF: number | null;

    /**
     * AC Reactive Power
     *
     * AC Reactive Power
     */
    VAr: number | null;

    /**
     * Scale Factor for Reactive Power
     */
    VAr_SF: number | null;

    /**
     * AC Power Factor
     *
     * AC Power Factor
     */
    PF: number | null;

    /**
     * Scale Factor for Power Factor
     */
    PF_SF: number | null;

    /**
     * AC Energy
     *
     * AC Energy
     */
    WH: number;

    /**
     * Scale Factor for Energy
     */
    WH_SF: number;

    /**
     * DC Amps
     *
     * DC Current
     */
    DCA: number | null;

    /**
     * Scale Factor for DC Current
     */
    DCA_SF: number | null;

    /**
     * DC Voltage
     *
     * DC Voltage
     */
    DCV: number | null;

    /**
     * Scale Factor for DC Voltage
     */
    DCV_SF: number | null;

    /**
     * DC Watts
     *
     * DC Power
     */
    DCW: number | null;

    /**
     * Scale Factor for DC Power
     */
    DCW_SF: number | null;

    /**
     * Cabinet Temperature
     *
     * Cabinet Temperature
     */
    TmpCab: number | null;

    /**
     * Heat Sink Temperature
     *
     * Heat Sink Temperature
     */
    TmpSnk: number | null;

    /**
     * Transformer Temperature
     *
     * Transformer Temperature
     */
    TmpTrns: number | null;

    /**
     * Other Temperature
     *
     * Other Temperature
     */
    TmpOt: number | null;

    /**
     * Scale Factor for Temperature
     */
    Tmp_SF: number | null;

    /**
     * Operating State
     *
     * Enumerated value. Operating state
     */
    St: InverterState;

    /**
     * Vendor Operating State
     *
     * Vendor specific operating state code
     */
    StVnd: number | null;

    /**
     * Event1
     *
     * Bitmask value. Event fields
     */
    Evt1: InverterEvent1;

    /**
     * Event Bitfield 2
     *
     * Reserved for future use
     */
    Evt2: number;

    /**
     * Vendor Event Bitfield 1
     *
     * Vendor defined events
     */
    EvtVnd1: number | null;

    /**
     * Vendor Event Bitfield 2
     *
     * Vendor defined events
     */
    EvtVnd2: number | null;

    /**
     * Vendor Event Bitfield 3
     *
     * Vendor defined events
     */
    EvtVnd3: number | null;

    /**
     * Vendor Event Bitfield 4
     *
     * Vendor defined events
     */
    EvtVnd4: number | null;
};

export const inverterModel = sunSpecModelFactory<InverterModel>({
    name: 'inverter',
    mapping: {
        ID: {
            start: 0,
            end: 1,
            readConverter: (value) => registersToId(value, [101, 102, 103]),
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
            readConverter: registersToInt16Nullable,
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
            readConverter: registersToSunssfNullable,
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

/**
 * InverterState Enumeration
 *
 * Enumerated values representing the operating state of the inverter
 */
export enum InverterState {
    // Off
    OFF = 1,
    // Sleeping (auto-shutdown)
    SLEEPING = 2,
    // Starting up
    STARTING = 3,
    // Tracking power point
    MPPT = 4,
    // Forced power reduction
    THROTTLED = 5,
    // Shutting down
    SHUTTING_DOWN = 6,
    // One or more faults exist
    FAULT = 7,
    // Standby (service on unit)* might be in Events
    STANDBY = 8,
}

/**
 * InverterEvent1 Bitfield Enumeration
 *
 * Bitmask values representing various event fields
 */
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
