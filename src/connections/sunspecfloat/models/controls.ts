import {
    registersToUint16,
    registersToInt16,
    registersToSunssf,
    uint16ToRegisters,
    int16ToRegisters,
    registersToUint16Nullable,
    uint16NullableToRegisters,
    registersToInt16Nullable,
    int16NullableToRegisters,
    registersToSunssfNullable,
    registersToId,
} from '../../modbus/helpers/converters.js';
import { modbusModelFactory } from '../../modbus/modbusModelFactory.js';

// generated from SunSpec_Information_Model_Reference_20240701.xlsx

/**
 * Controls
 *
 * Immediate Inverter Controls
 */
export type ControlsModel = {
    /**
     * Model ID
     *
     * Model identifier.
     */
    ID: 123;

    /**
     * Model Length
     *
     * Model length.
     */
    L: number;

    /**
     * Conn_WinTms
     *
     * Time window for connect/disconnect.
     */
    Conn_WinTms: number | null;

    /**
     * Conn_RvrtTms
     *
     * Timeout period for connect/disconnect.
     */
    Conn_RvrtTms: number | null;

    /**
     * Conn
     *
     * Enumerated valued. Connection control.
     */
    Conn: Conn;

    /**
     * WMaxLimPct
     *
     * Set power output to specified level.
     */
    WMaxLimPct: number;

    /**
     * WMaxLimPct_WinTms
     *
     * Time window for power limit change.
     */
    WMaxLimPct_WinTms: number | null;

    /**
     * WMaxLimPct_RvrtTms
     *
     * Timeout period for power limit.
     */
    WMaxLimPct_RvrtTms: number | null;

    /**
     * WMaxLimPct_RmpTms
     *
     * Ramp time for moving from current setpoint to new setpoint.
     */
    WMaxLimPct_RmpTms: number | null;

    /**
     * WMaxLim_Ena
     *
     * Enumerated valued. Throttle enable/disable control.
     */
    WMaxLim_Ena: WMaxLim_Ena;

    /**
     * OutPFSet
     *
     * Set power factor to specific value - cosine of angle.
     */
    OutPFSet: number;

    /**
     * OutPFSet_WinTms
     *
     * Time window for power factor change.
     */
    OutPFSet_WinTms: number | null;

    /**
     * OutPFSet_RvrtTms
     *
     * Timeout period for power factor.
     */
    OutPFSet_RvrtTms: number | null;

    /**
     * OutPFSet_RmpTms
     *
     * Ramp time for moving from current setpoint to new setpoint.
     */
    OutPFSet_RmpTms: number | null;

    /**
     * OutPFSet_Ena
     *
     * Enumerated valued. Fixed power factor enable/disable control.
     */
    OutPFSet_Ena: OutPFSet_Ena;

    /**
     * VArWMaxPct
     *
     * Reactive power in percent of WMax.
     */
    VArWMaxPct: number | null;

    /**
     * VArMaxPct
     *
     * Reactive power in percent of VArMax.
     */
    VArMaxPct: number | null;

    /**
     * VArAvalPct
     *
     * Reactive power in percent of VArAval.
     */
    VArAvalPct: number | null;

    /**
     * VArPct_WinTms
     *
     * Time window for VAR limit change.
     */
    VArPct_WinTms: number | null;

    /**
     * VArPct_RvrtTms
     *
     * Timeout period for VAR limit.
     */
    VArPct_RvrtTms: number | null;

    /**
     * VArPct_RmpTms
     *
     * Ramp time for moving from current setpoint to new setpoint.
     */
    VArPct_RmpTms: number | null;

    /**
     * VArPct_Mod
     *
     * Enumerated value. VAR percent limit mode.
     */
    VArPct_Mod: VArPct_Mod | null;

    /**
     * VArPct_Ena
     *
     * Enumerated valued. Percent limit VAr enable/disable control.
     */
    VArPct_Ena: VArPct_Ena;

    /**
     * WMaxLimPct_SF
     *
     * Scale factor for power output percent.
     */
    WMaxLimPct_SF: number;

    /**
     * OutPFSet_SF
     *
     * Scale factor for power factor.
     */
    OutPFSet_SF: number;

    /**
     * VArPct_SF
     *
     * Scale factor for reactive power percent.
     */
    VArPct_SF: number | null;
};

export type ControlsModelWrite = Pick<
    ControlsModel,
    | 'Conn_WinTms'
    | 'Conn_RvrtTms'
    | 'Conn'
    | 'WMaxLimPct'
    | 'WMaxLimPct_WinTms'
    | 'WMaxLimPct_RvrtTms'
    | 'WMaxLimPct_RmpTms'
    | 'WMaxLim_Ena'
    | 'OutPFSet'
    | 'OutPFSet_WinTms'
    | 'OutPFSet_RvrtTms'
    | 'OutPFSet_RmpTms'
    | 'OutPFSet_Ena'
    | 'VArWMaxPct'
    | 'VArMaxPct'
    | 'VArAvalPct'
    | 'VArPct_WinTms'
    | 'VArPct_RvrtTms'
    | 'VArPct_RmpTms'
    | 'VArPct_Mod'
    | 'VArPct_Ena'
>;

export const controlsModel = modbusModelFactory<
    ControlsModel,
    keyof ControlsModelWrite
>({
    name: 'controls',
    mapping: {
        ID: {
            start: 0,
            end: 1,
            readConverter: (value) => registersToId(value, 123),
        },
        L: {
            start: 1,
            end: 2,
            readConverter: registersToUint16,
        },
        Conn_WinTms: {
            start: 2,
            end: 3,
            readConverter: registersToUint16Nullable,
            writeConverter: uint16NullableToRegisters,
        },
        Conn_RvrtTms: {
            start: 3,
            end: 4,
            readConverter: registersToUint16Nullable,
            writeConverter: uint16NullableToRegisters,
        },
        Conn: {
            start: 4,
            end: 5,
            readConverter: registersToUint16,
            writeConverter: uint16ToRegisters,
        },
        WMaxLimPct: {
            start: 5,
            end: 6,
            readConverter: registersToUint16,
            writeConverter: uint16ToRegisters,
        },
        WMaxLimPct_WinTms: {
            start: 6,
            end: 7,
            readConverter: registersToUint16Nullable,
            writeConverter: uint16NullableToRegisters,
        },
        WMaxLimPct_RvrtTms: {
            start: 7,
            end: 8,
            readConverter: registersToUint16Nullable,
            writeConverter: uint16NullableToRegisters,
        },
        WMaxLimPct_RmpTms: {
            start: 8,
            end: 9,
            readConverter: registersToUint16Nullable,
            writeConverter: uint16NullableToRegisters,
        },
        WMaxLim_Ena: {
            start: 9,
            end: 10,
            readConverter: registersToUint16,
            writeConverter: uint16ToRegisters,
        },
        OutPFSet: {
            start: 10,
            end: 11,
            readConverter: registersToInt16,
            writeConverter: int16ToRegisters,
        },
        OutPFSet_WinTms: {
            start: 11,
            end: 12,
            readConverter: registersToUint16Nullable,
            writeConverter: uint16NullableToRegisters,
        },
        OutPFSet_RvrtTms: {
            start: 12,
            end: 13,
            readConverter: registersToUint16Nullable,
            writeConverter: uint16NullableToRegisters,
        },
        OutPFSet_RmpTms: {
            start: 13,
            end: 14,
            readConverter: registersToUint16Nullable,
            writeConverter: uint16NullableToRegisters,
        },
        OutPFSet_Ena: {
            start: 14,
            end: 15,
            readConverter: registersToUint16,
            writeConverter: uint16ToRegisters,
        },
        VArWMaxPct: {
            start: 15,
            end: 16,
            readConverter: registersToInt16Nullable,
            writeConverter: int16NullableToRegisters,
        },
        VArMaxPct: {
            start: 16,
            end: 17,
            readConverter: registersToInt16Nullable,
            writeConverter: int16NullableToRegisters,
        },
        VArAvalPct: {
            start: 17,
            end: 18,
            readConverter: registersToInt16Nullable,
            writeConverter: int16NullableToRegisters,
        },
        VArPct_WinTms: {
            start: 18,
            end: 19,
            readConverter: registersToUint16Nullable,
            writeConverter: uint16NullableToRegisters,
        },
        VArPct_RvrtTms: {
            start: 19,
            end: 20,
            readConverter: registersToUint16Nullable,
            writeConverter: uint16NullableToRegisters,
        },
        VArPct_RmpTms: {
            start: 20,
            end: 21,
            readConverter: registersToUint16Nullable,
            writeConverter: uint16NullableToRegisters,
        },
        VArPct_Mod: {
            start: 21,
            end: 22,
            readConverter: registersToUint16Nullable,
            writeConverter: uint16NullableToRegisters,
        },
        VArPct_Ena: {
            start: 22,
            end: 23,
            readConverter: registersToUint16,
            writeConverter: uint16ToRegisters,
        },
        WMaxLimPct_SF: {
            start: 23,
            end: 24,
            readConverter: registersToSunssf,
        },
        OutPFSet_SF: {
            start: 24,
            end: 25,
            readConverter: registersToSunssf,
        },
        VArPct_SF: {
            start: 25,
            end: 26,
            readConverter: registersToSunssfNullable,
        },
    },
});

/**
 * Conn Enumeration
 *
 * Enumerated values representing Connection control.
 */
export enum Conn {
    DISCONNECT = 0,
    CONNECT = 1,
}

/**
 * WMaxLim_Ena Enumeration
 *
 * Enumerated values representing Throttle enable/disable control.
 */
export enum WMaxLim_Ena {
    DISABLED = 0,
    ENABLED = 1,
}

/**
 * OutPFSet_Ena Enumeration
 *
 * Enumerated values representing Fixed power factor enable/disable control.
 */
export enum OutPFSet_Ena {
    DISABLED = 0,
    ENABLED = 1,
}

/**
 * VArPct_Mod Enumeration
 *
 * Enumerated values representing VAR percent limit mode.
 */
export enum VArPct_Mod {
    NONE = 0,
    WMax = 1,
    VArMax = 2,
    VArAval = 3,
}

/**
 * VArPct_Ena Enumeration
 *
 * Enumerated values representing Percent limit VAr enable/disable control.
 */
export enum VArPct_Ena {
    DISABLED = 0,
    ENABLED = 1,
}
