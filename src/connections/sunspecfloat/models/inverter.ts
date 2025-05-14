import {
    registersToUint16,
    registersToUint32,
    registersToUint16Nullable,
    registersToUint32Nullable,
    registersToId,
    registersToFloat32,
} from '../../modbus/helpers/converters.js';
import { modbusModelFactory } from '../../modbus/modbusModelFactory.js';

// generated from SunSpec_Information_Model_Reference_20240701.xlsx

/**
 * Inverter (Single Phase, Split-Phase, Three Phase)
 *
 * A combination of the three models for single phase, split-phase, and three phase inverters
 */
export type InverterModelfloat = {
    /**
     * Model ID
     *
     * Model identifier
     */
    ID: 111 | 112 | 113;

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
     * AC Power
     *
     * AC Power
     */
    W: number;

    /**
     * Line Frequency
     *
     * Line Frequency
     */
    Hz: number;

    /**
     * AC Apparent Power
     *
     * AC Apparent Power
     */
    VA: number | null;

    /**
     * AC Reactive Power
     *
     * AC Reactive Power
     */
    VAr: number | null;

    /**
     * AC Power Factor
     *
     * AC Power Factor
     */
    PF: number | null;

    /**
     * AC Energy
     *
     * AC Energy
     */
    WH: number;

    /**
     * DC Amps
     *
     * DC Current
     */
    DCA: number | null;

    /**
     * DC Voltage
     *
     * DC Voltage
     */
    DCV: number | null;

    /**
     * DC Watts
     *
     * DC Power
     */
    DCW: number | null;

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

export const inverterModelfloat = modbusModelFactory<InverterModelfloat>({
    name: 'inverter',
    mapping: {
        ID: {
            start: 0,
            end: 1,
            readConverter: (value) => registersToId(value, [111, 112, 113]),
        },
        L: {
            start: 1,
            end: 2,
            readConverter: registersToUint16,
        },
        A: {
            start: 2,
            end: 4,
            readConverter: registersToFloat32,
        },
        AphA: {
            start: 4,
            end: 6,
            readConverter: registersToFloat32,
        },
        AphB: {
            start: 6,
            end: 8,
            readConverter: registersToFloat32,
        },
        AphC: {
            start: 8,
            end: 10,
            readConverter: registersToFloat32,
        },
        PPVphAB: {
            start: 10,
            end: 12,
            readConverter: registersToFloat32,
        },
        PPVphBC: {
            start: 12,
            end: 14,
            readConverter: registersToFloat32,
        },
        PPVphCA: {
            start: 14,
            end: 16,
            readConverter: registersToFloat32,
        },
        PhVphA: {
            start: 16,
            end: 18,
            readConverter: registersToFloat32,
        },
        PhVphB: {
            start: 18,
            end: 20,
            readConverter: registersToFloat32,
        },
        PhVphC: {
            start: 20,
            end: 22,
            readConverter: registersToFloat32,
        },
        W: {
            start: 22,
            end: 24,
            readConverter: registersToFloat32,
        },
        Hz: {
            start: 24,
            end: 26,
            readConverter: registersToFloat32,
        },
        VA: {
            start: 26,
            end: 28,
            readConverter: registersToFloat32,
        },
        VAr: {
            start: 28,
            end: 30,
            readConverter: registersToFloat32,
        },
        PF: {
            start: 30,
            end: 32,
            readConverter: registersToFloat32,
        },
        WH: {
            start: 32,
            end: 34,
            readConverter: registersToFloat32,
        },
        DCA: {
            start: 34,
            end: 36,
            readConverter: registersToFloat32,
        },
        DCV: {
            start: 36,
            end: 38,
            readConverter: registersToFloat32,
        },
        DCW: {
            start: 38,
            end: 40,
            readConverter: registersToFloat32,
        },
        TmpCab: {
            start: 40,
            end: 42,
            readConverter: registersToFloat32,
        },
        TmpSnk: {
            start: 42,
            end: 44,
            readConverter: registersToFloat32,
        },
        TmpTrns: {
            start: 44,
            end: 46,
            readConverter: registersToFloat32,
        },
        TmpOt: {
            start: 46,
            end: 48,
            readConverter: registersToFloat32,
        },
        St: {
            start: 48,
            end: 49,
            readConverter: registersToUint16,
        },
        StVnd: {
            start: 49,
            end: 50,
            readConverter: registersToUint16Nullable,
        },
        Evt1: {
            start: 50,
            end: 52,
            readConverter: registersToUint32,
        },
        Evt2: {
            start: 52,
            end: 54,
            readConverter: registersToUint32,
        },
        EvtVnd1: {
            start: 54,
            end: 56,
            readConverter: registersToUint32Nullable,
        },
        EvtVnd2: {
            start: 56,
            end: 58,
            readConverter: registersToUint32Nullable,
        },
        EvtVnd3: {
            start: 58,
            end: 60,
            readConverter: registersToUint32Nullable,
        },
        EvtVnd4: {
            start: 60,
            end: 62,
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
