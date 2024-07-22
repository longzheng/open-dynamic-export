import {
    registersToUint16,
    registersToInt16,
    registersToSunssf,
} from '../helpers/converters';
import type { SunSpecBrand } from './brand';
import { sunSpecModelFactory } from './sunSpecModelFactory';

// https://sunspec.org/wp-content/uploads/2021/12/SunSpec_Information_Model_Reference_20211209.xlsx
export type ControlsModel = {
    // Model identifier
    ID: number;
    // Model length
    L: number;
    // Time window for connect/disconnect
    Conn_WinTms: number;
    // Timeout period for connect/disconnect
    Conn_RvrtTms: number;
    // Enumerated valued. Connection control
    Conn: Conn;
    // Set power output to specified level
    WMaxLimPct: number;
    // Time window for power limit change
    WMaxLimPct_WinTms: number;
    // Timeout period for power limit
    WMaxLimPct_RvrtTms: number;
    // Ramp time for moving from current setpoint to new setpoint
    WMaxLimPct_RmpTms: number;
    // Enumerated valued. Throttle enable/disable control
    WMaxLim_Ena: WMaxLim_Ena;
    // Set power factor to specific value - cosine of angle
    OutPFSet: number;
    // Time window for power factor change
    OutPFSet_WinTms: number;
    // Timeout period for power factor
    OutPFSet_RvrtTms: number;
    // Ramp time for moving from current setpoint to new setpoint
    OutPFSet_RmpTms: number;
    // Enumerated valued. Fixed power factor enable/disable control
    OutPFSet_Ena: OutPFSet_Ena;
    // Reactive power in percent of WMax
    VArWMaxPct: number;
    // Reactive power in percent of VArMax
    VArMaxPct: number;
    // Reactive power in percent of VArAval
    VArAvalPct: number;
    // Time window for VAR limit change
    VArPct_WinTms: number;
    // Timeout period for VAR limit
    VArPct_RvrtTms: number;
    // Ramp time for moving from current setpoint to new setpoint
    VArPct_RmpTms: number;
    // Enumerated value. VAR percent limit mode
    VArPct_Mod: VArPct_Mod;
    // Enumerated valued. Percent limit VAr enable/disable control
    VArPct_Ena: VArPct_Ena;
    // Scale factor for power output percent
    WMaxLimPct_SF: number;
    // Scale factor for power factor
    OutPFSet_SF: number;
    // Scale factor for reactive power percent
    VArPct_SF: number;
};

export const controlsModel = sunSpecModelFactory<ControlsModel>({
    addressLength: 26,
    mapping: {
        ID: {
            start: 0,
            end: 1,
            converter: registersToUint16,
        },
        L: {
            start: 1,
            end: 2,
            converter: registersToUint16,
        },
        Conn_WinTms: {
            start: 2,
            end: 3,
            converter: registersToUint16,
        },
        Conn_RvrtTms: {
            start: 3,
            end: 4,
            converter: registersToUint16,
        },
        Conn: {
            start: 4,
            end: 5,
            converter: registersToUint16,
        },
        WMaxLimPct: {
            start: 5,
            end: 6,
            converter: registersToUint16,
        },
        WMaxLimPct_WinTms: {
            start: 6,
            end: 7,
            converter: registersToUint16,
        },
        WMaxLimPct_RvrtTms: {
            start: 7,
            end: 8,
            converter: registersToUint16,
        },
        WMaxLimPct_RmpTms: {
            start: 8,
            end: 9,
            converter: registersToUint16,
        },
        WMaxLim_Ena: {
            start: 9,
            end: 10,
            converter: registersToUint16,
        },
        OutPFSet: {
            start: 10,
            end: 11,
            converter: registersToInt16,
        },
        OutPFSet_WinTms: {
            start: 11,
            end: 12,
            converter: registersToUint16,
        },
        OutPFSet_RvrtTms: {
            start: 12,
            end: 13,
            converter: registersToUint16,
        },
        OutPFSet_RmpTms: {
            start: 13,
            end: 14,
            converter: registersToUint16,
        },
        OutPFSet_Ena: {
            start: 14,
            end: 15,
            converter: registersToUint16,
        },
        VArWMaxPct: {
            start: 15,
            end: 16,
            converter: registersToInt16,
        },
        VArMaxPct: {
            start: 16,
            end: 17,
            converter: registersToInt16,
        },
        VArAvalPct: {
            start: 17,
            end: 18,
            converter: registersToInt16,
        },
        VArPct_WinTms: {
            start: 18,
            end: 19,
            converter: registersToUint16,
        },
        VArPct_RvrtTms: {
            start: 19,
            end: 20,
            converter: registersToUint16,
        },
        VArPct_RmpTms: {
            start: 20,
            end: 21,
            converter: registersToUint16,
        },
        VArPct_Mod: {
            start: 21,
            end: 22,
            converter: registersToUint16,
        },
        VArPct_Ena: {
            start: 22,
            end: 23,
            converter: registersToUint16,
        },
        WMaxLimPct_SF: {
            start: 23,
            end: 24,
            converter: registersToSunssf,
        },
        OutPFSet_SF: {
            start: 24,
            end: 25,
            converter: registersToSunssf,
        },
        VArPct_SF: {
            start: 25,
            end: 26,
            converter: registersToSunssf,
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
