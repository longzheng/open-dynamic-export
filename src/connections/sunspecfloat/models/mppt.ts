import {
    registersToAcc32Nullable,
    registersToId,
    registersToInt16Nullable,
    registersToStringNullable,
    registersToSunssfNullable,
    registersToUint16,
    registersToUint16Nullable,
    registersToUint32Nullable,
} from '../../modbus/helpers/converters.js';
import { modbusModelFactory } from '../../modbus/modbusModelFactory.js';

/**
 * MPPT
 *
 * Multiple MPPT Inverter Extension Model
 */
export type MpptModel = {
    /**
     * Model ID
     *
     * Model identifier
     */
    ID: 160;

    /**
     * Model Length
     *
     * Model length
     */
    L: number;

    /**
     * DCA_SF
     *
     * Current Scale Factor
     */
    DCA_SF: number | null;

    /**
     * DCV_SF
     *
     * Voltage Scale Factor
     */
    DCV_SF: number | null;

    /**
     * DCW_SF
     *
     * Power Scale Factor
     */
    DCW_SF: number | null;

    /**
     * DCWH_SF
     *
     * Energy Scale Factor
     */
    DCWH_SF: number | null;

    /**
     * Evt
     *
     * Global Events
     */
    Evt: MpptEvt | null;

    /**
     * N
     *
     * Number of Modules
     */
    N: number | null;

    /**
     * TmsPer
     *
     * Timestamp Period
     */
    TmsPer: number | null;
};

// Multiple MPPT modules, based on the N register
export type MpptModuleModel = {
    /**
     * ID
     *
     * Input ID
     */
    ID: number | null;

    /**
     * IDStr
     *
     * Input ID String
     */
    IDStr: string | null;

    /**
     * DCA
     *
     * DC Current
     */
    DCA: number | null;

    /**
     * DCV
     *
     * DC Voltage
     */
    DCV: number | null;

    /**
     * DCW
     *
     * DC Power
     */
    DCW: number | null;

    /**
     * DCWH
     *
     * Lifetime Energy
     */
    DCWH: number | null;

    /**
     * Tms
     *
     * Timestamp
     */
    Tms: number | null;

    /**
     * Tmp
     *
     * Temperature
     */
    Tmp: number | null;

    /**
     * DCSt
     *
     * Operating State
     */
    DCSt: DcSt | null;

    /**
     * DCEvt
     *
     * Module Events
     */
    DcEvt: MpptEvt | null;
};

export const mpptModel = modbusModelFactory<MpptModel>({
    name: 'mppt',
    mapping: {
        ID: {
            start: 0,
            end: 1,
            readConverter: (value) => registersToId(value, 160),
        },
        L: {
            start: 1,
            end: 2,
            readConverter: registersToUint16,
        },
        DCA_SF: {
            start: 2,
            end: 3,
            readConverter: registersToSunssfNullable,
        },
        DCV_SF: {
            start: 3,
            end: 4,
            readConverter: registersToSunssfNullable,
        },
        DCW_SF: {
            start: 4,
            end: 5,
            readConverter: registersToSunssfNullable,
        },
        DCWH_SF: {
            start: 5,
            end: 6,
            readConverter: registersToSunssfNullable,
        },
        Evt: {
            start: 6,
            end: 8,
            readConverter: registersToUint32Nullable,
        },
        N: {
            start: 8,
            end: 9,
            readConverter: registersToUint16Nullable,
        },
        TmsPer: {
            start: 9,
            end: 10,
            readConverter: registersToUint16Nullable,
        },
    },
});

// Multiple MPPT modules, based on the N register
export const mpptModuleModel = modbusModelFactory<MpptModuleModel>({
    name: 'mppt.module',
    mapping: {
        ID: {
            start: 0,
            end: 1,
            readConverter: registersToUint16Nullable,
        },
        IDStr: {
            start: 1,
            end: 9,
            readConverter: registersToStringNullable,
        },
        DCA: {
            start: 9,
            end: 10,
            readConverter: registersToUint16Nullable,
        },
        DCV: {
            start: 10,
            end: 11,
            readConverter: registersToUint16Nullable,
        },
        DCW: {
            start: 11,
            end: 12,
            readConverter: registersToUint16Nullable,
        },
        DCWH: {
            start: 12,
            end: 14,
            readConverter: registersToAcc32Nullable,
        },
        Tms: {
            start: 14,
            end: 16,
            readConverter: registersToUint32Nullable,
        },
        Tmp: {
            start: 16,
            end: 17,
            readConverter: registersToInt16Nullable,
        },
        DCSt: {
            start: 17,
            end: 18,
            readConverter: registersToUint16Nullable,
        },
        DcEvt: {
            start: 18,
            end: 20,
            readConverter: registersToUint32Nullable,
        },
    },
});

/**
 * Evt Enumeration
 *
 * Bitmask values representing the global events + module specific events
 */
export enum MpptEvt {
    GROUND_FAULT = 1 << 0,
    INPUT_OVER_VOLTAGE = 1 << 1,
    RESERVED_2 = 1 << 2,
    DC_DISCONNECT = 1 << 3,
    RESERVED_4 = 1 << 4,
    CABINET_OPEN = 1 << 5,
    MANUAL_SHUTDOWN = 1 << 6,
    OVER_TEMP = 1 << 7,
    RESERVED_8 = 1 << 8,
    RESERVED_9 = 1 << 9,
    RESERVED_10 = 1 << 10,
    RESERVED_11 = 1 << 11,
    BLOWN_FUSE = 1 << 12,
    UNDER_TEMP = 1 << 13,
    MEMORY_LOSS = 1 << 14,
    ARC_DETECTION = 1 << 15,
    RESERVED_16 = 1 << 16,
    RESERVED_17 = 1 << 17,
    RESERVED_18 = 1 << 18,
    RESERVED_19 = 1 << 19,
    TEST_FAILED = 1 << 20,
    INPUT_UNDER_VOLTAGE = 1 << 21,
    INPUT_OVER_CURRENT = 1 << 22,
}

/**
 * DCSt Enumeration
 *
 * Bitmask values representing the Operating State
 */
export enum DcSt {
    OFF = 1,
    SLEEPING = 2,
    STARTING = 3,
    MPPT = 4,
    THROTTLED = 5,
    SHUTTING_DOWN = 6,
    FAULT = 7,
    STANDBY = 8,
    TEST = 9,
    RESERVED_10 = 10,
}
