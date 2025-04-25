import {
    int16NullableToRegisters,
    registersToId,
    registersToInt16Nullable,
    registersToUint16,
    registersToSunssf,
    registersToSunssfNullable,
    registersToUint16Nullable,
    uint16ToRegisters,
    uint16NullableToRegisters,
} from '../../modbus/helpers/converters.js';
import { modbusModelFactory } from '../../modbus/modbusModelFactory.js';

// Generated from https://github.com/sunspec/models/blob/master/json/model_124.json
// (which is the source for SunSpec_Information_Model_Reference_20240701.xlsx)

/**
 * Storage
 *
 * Basic Storage Controls
 */
export type StorageModel = {
    /**
     * Model ID
     *
     * Model identifier
     */
    ID: 124;

    /**
     * Model Length
     *
     * Model length
     */
    L: number;

    /**
     * WChaMax
     *
     * Setpoint for maximum charge.
     */
    WChaMax: number;

    /**
     * WChaGra
     *
     * Setpoint for maximum charging rate. Default is MaxChaRte.
     */
    WChaGra: number;

    /**
     * WDisChaGra
     *
     * Setpoint for maximum discharging rate. Default is MaxDisChaRte.
     */
    WDisChaGra: number;

    /**
     * Storctl_Mod
     *
     * Activate hold/discharge/charge storage control mode. Bitfield value.
     */
    StorCtl_Mod: StorCtl_Mod;

    /**
     * VAChaMax
     *
     * Setpoint for maximum charging VA.
     */
    VAChaMax: number | null;

    /**
     * MinRsvPct
     *
     * Setpoint for minimum reserve for storage as a percentage of the nominal maximum storage.
     */
    MinRsvPct: number | null;

    /**
     * ChaState
     *
     * Currently available energy as a percent of the capacity rating.
     */
    ChaState: number | null;

    /**
     * StorAval
     *
     * State of charge (ChaState) minus storage reserve (MinRsvPct) times capacity rating (AhrRtg).
     */
    StorAval: number | null;

    /**
     * InBatV
     *
     * Internal battery voltage.
     */
    InBatV: number | null;

    /**
     * ChaSt
     *
     * Charge status of storage device. Enumerated value.
     */
    ChaSt: ChaSt | null;

    /**
     * OutWRte
     *
     * Percent of max discharge rate.
     */
    OutWRte: number | null;

    /**
     * InWRte
     *
     * Percent of max charging rate.
     */
    InWRte: number | null;

    /**
     * InOutWRte_WinTms
     *
     * Time window for charge/discharge rate change.
     */
    InOutWRte_WinTms: number | null;

    /**
     * InOutWRte_RvrtTms
     *
     * Timeout period for charge/discharge rate.
     */
    InOutWRte_RvrtTms: number | null;

    /**
     * InOutWRte_RmpTms
     *
     * Ramp time for moving from current setpoint to new setpoint.
     */
    InOutWRte_RmpTms: number | null;

    /**
     * ChaGriSet
     *
     * Charge grid setpoint.
     */
    ChaGriSet: ChaGriSet | null;

    /**
     * WChaMax_SF
     *
     * Scale factor for maximum charge.
     */
    WChaMax_SF: number;

    /**
     * WChaDisChaGra_SF
     *
     * Scale factor for maximum charge and discharge rate.
     */
    WChaDisChaGra_SF: number;

    /**
     * VAChaMax_SF
     *
     * Scale factor for maximum charging VA.
     */
    VAChaMax_SF: number | null;

    /**
     * MinRsvPct_SF
     *
     * Scale factor for minimum reserve percentage.
     */
    MinRsvPct_SF: number | null;

    /**
     * ChaState_SF
     *
     * Scale factor for available energy percent.
     */
    ChaState_SF: number | null;

    /**
     * StorAval_SF
     *
     * Scale factor for state of charge.
     */
    StorAval_SF: number | null;

    /**
     * InBatV_SF
     *
     * Scale factor for battery voltage.
     */
    InBatV_SF: number | null;

    /**
     * InOutWRte_SF
     *
     * Scale factor for percent charge/discharge rate.
     */
    InOutWRte_SF: number | null;
};

// NOTE: based on SunSpec model docs
// not all of these are writable by all SunSpec devices, verify in vendor specific documentation
export type StorageModelWrite = Pick<
    StorageModel,
    | 'WChaMax'
    | 'WChaGra'
    | 'WDisChaGra'
    | 'StorCtl_Mod'
    | 'VAChaMax'
    | 'MinRsvPct'
    | 'OutWRte'
    | 'InWRte'
    | 'InOutWRte_WinTms'
    | 'InOutWRte_RvrtTms'
    | 'InOutWRte_RmpTms'
    | 'ChaGriSet'
>;

export const storageModel = modbusModelFactory<
    StorageModel,
    keyof StorageModelWrite
>({
    name: 'storage',
    mapping: {
        ID: {
            start: 0,
            end: 1,
            readConverter: (value) => registersToId(value, 124),
        },
        L: {
            start: 1,
            end: 2,
            readConverter: registersToUint16,
        },
        WChaMax: {
            start: 2,
            end: 3,
            readConverter: registersToUint16,
            writeConverter: uint16ToRegisters,
        },
        WChaGra: {
            start: 3,
            end: 4,
            readConverter: registersToUint16,
            writeConverter: uint16ToRegisters,
        },
        WDisChaGra: {
            start: 4,
            end: 5,
            readConverter: registersToUint16,
            writeConverter: uint16ToRegisters,
        },
        StorCtl_Mod: {
            start: 5,
            end: 6,
            readConverter: registersToUint16,
            writeConverter: uint16ToRegisters,
        },
        VAChaMax: {
            start: 6,
            end: 7,
            readConverter: registersToUint16Nullable,
            writeConverter: uint16NullableToRegisters,
        },
        MinRsvPct: {
            start: 7,
            end: 8,
            readConverter: registersToUint16Nullable,
            writeConverter: uint16NullableToRegisters,
        },
        ChaState: {
            start: 8,
            end: 9,
            readConverter: registersToUint16Nullable,
        },
        StorAval: {
            start: 9,
            end: 10,
            readConverter: registersToUint16Nullable,
        },
        InBatV: {
            start: 10,
            end: 11,
            readConverter: registersToUint16Nullable,
        },
        ChaSt: {
            start: 11,
            end: 12,
            readConverter: registersToUint16Nullable,
        },
        /*
         * Additional detail from Fronius doc Gen24_Primo_Symo_Inverter_Register_Map_Float_storage_ROW.xlsx:
         * For OutWRte and InWRte:

           valid range -100.00% - +100.00%

           Please note that this register has a scale factor in Register InOutWRte_SF, so for InOutWRte_SF = -2 the valid range
           in raw values is from -10000 to 10000.

           Please be aware that setting an invalid power window WILL RESULT IN a modbus exception 3 (ILLEGAL DATA VALUE).
           Invalid power windows are all windows where condition:
           ((StorCtl_Mod == 3) AND ((-1) * InWRtg > OutWRtg))
           evaluates to true.
           This can happen for example if two negative values are written into InWRtg and OutWRtg and both limits are activated
           by StorCtl_Mod = 3.

           */
        OutWRte: {
            start: 12,
            end: 13,
            readConverter: registersToInt16Nullable,
            writeConverter: int16NullableToRegisters,
        },
        InWRte: {
            start: 13,
            end: 14,
            readConverter: registersToInt16Nullable,
            writeConverter: int16NullableToRegisters,
        },
        InOutWRte_WinTms: {
            start: 14,
            end: 15,
            readConverter: registersToUint16Nullable,
            writeConverter: uint16NullableToRegisters,
        },
        InOutWRte_RvrtTms: {
            start: 15,
            end: 16,
            readConverter: registersToUint16Nullable,
            writeConverter: uint16NullableToRegisters,
        },
        InOutWRte_RmpTms: {
            start: 16,
            end: 17,
            readConverter: registersToUint16Nullable,
            writeConverter: uint16NullableToRegisters,
        },
        ChaGriSet: {
            start: 17,
            end: 18,
            readConverter: registersToUint16Nullable,
            writeConverter: uint16NullableToRegisters,
        },
        WChaMax_SF: {
            start: 18,
            end: 19,
            readConverter: registersToSunssf,
        },
        WChaDisChaGra_SF: {
            start: 19,
            end: 20,
            readConverter: registersToSunssf,
        },
        VAChaMax_SF: {
            start: 20,
            end: 21,
            readConverter: registersToSunssfNullable,
        },
        MinRsvPct_SF: {
            start: 21,
            end: 22,
            readConverter: registersToSunssfNullable,
        },
        ChaState_SF: {
            start: 22,
            end: 23,
            readConverter: registersToSunssfNullable,
        },
        StorAval_SF: {
            start: 23,
            end: 24,
            readConverter: registersToSunssfNullable,
        },
        InBatV_SF: {
            start: 24,
            end: 25,
            readConverter: registersToSunssfNullable,
        },
        InOutWRte_SF: {
            start: 25,
            end: 26,
            readConverter: registersToSunssfNullable,
        },
    },
});

/**
 * StorCtl_Mod Enumeration
 *
 * Bitmask values representing activate hold/discharge/charge storage control mode.
 */
export enum StorCtl_Mod {
    CHARGE = 1 << 0,
    DISCHARGE = 1 << 1,
}

/**
 * ChaSt Enumeration
 *
 * Enumerated values representing charge status of storage device.
 */
export enum ChaSt {
    OFF = 1,
    EMPTY = 2,
    DISCHARGING = 3,
    CHARGING = 4,
    FULL = 5,
    HOLDING = 6,
    TESTING = 7,
}

/**
 * ChaGriSet Enumeration
 *
 * Enumerated values representing if charging from grid is permitted.
 */
export enum ChaGriSet {
    PV = 0,
    GRID = 1,
}
