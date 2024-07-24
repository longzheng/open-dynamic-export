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
} from '../helpers/converters';
import type { SunSpecBrand } from './brand';
import { sunSpecModelFactory } from './sunSpecModelFactory';

// https://sunspec.org/wp-content/uploads/2021/12/SunSpec_Information_Model_Reference_20211209.xlsx
export type ControlsModel = {
    // Model identifier
    // 123 is Immediate Inverter Controls
    ID: number;
    // Model length
    L: number;
    // Time window for connect/disconnect
    Conn_WinTms: number | null;
    // Timeout period for connect/disconnect
    Conn_RvrtTms: number | null;
    // Enumerated valued. Connection control
    Conn: Conn;
    // Set power output to specified level
    WMaxLimPct: number;
    // Time window for power limit change
    WMaxLimPct_WinTms: number | null;
    // Timeout period for power limit
    WMaxLimPct_RvrtTms: number | null;
    // Ramp time for moving from current setpoint to new setpoint
    WMaxLimPct_RmpTms: number | null;
    // Enumerated valued. Throttle enable/disable control
    WMaxLim_Ena: WMaxLim_Ena;
    // Set power factor to specific value - cosine of angle
    OutPFSet: number;
    // Time window for power factor change
    OutPFSet_WinTms: number | null;
    // Timeout period for power factor
    OutPFSet_RvrtTms: number | null;
    // Ramp time for moving from current setpoint to new setpoint
    OutPFSet_RmpTms: number | null;
    // Enumerated valued. Fixed power factor enable/disable control
    OutPFSet_Ena: OutPFSet_Ena;
    // Reactive power in percent of WMax
    VArWMaxPct: number | null;
    // Reactive power in percent of VArMax
    VArMaxPct: number | null;
    // Reactive power in percent of VArAval
    VArAvalPct: number | null;
    // Time window for VAR limit change
    VArPct_WinTms: number | null;
    // Timeout period for VAR limit
    VArPct_RvrtTms: number | null;
    // Ramp time for moving from current setpoint to new setpoint
    VArPct_RmpTms: number | null;
    // Enumerated value. VAR percent limit mode
    VArPct_Mod: VArPct_Mod | null;
    // Enumerated valued. Percent limit VAr enable/disable control
    VArPct_Ena: VArPct_Ena;
    // Scale factor for power output percent
    WMaxLimPct_SF: number;
    // Scale factor for power factor
    OutPFSet_SF: number;
    // Scale factor for reactive power percent
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

export const controlsModel = sunSpecModelFactory<
    ControlsModel,
    keyof ControlsModelWrite
>({
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

export function controlsModelAddressStartByBrand(brand: SunSpecBrand) {
    switch (brand) {
        case 'fronius':
            return 40227;
        case 'sma':
            throw new Error('Not implemented');
        case 'solaredge':
            throw new Error('Not implemented');
    }
}

export enum Conn {
    DISCONNECT = 0,
    CONNECT = 1,
}

export enum WMaxLim_Ena {
    DISABLED = 0,
    ENABLED = 1,
}

export enum OutPFSet_Ena {
    DISABLED = 0,
    ENABLED = 1,
}

export enum VArPct_Mod {
    NONE = 0,
    WMax = 1,
    VArMax = 2,
    VArAval = 3,
}

export enum VArPct_Ena {
    DISABLED = 0,
    ENABLED = 1,
}
