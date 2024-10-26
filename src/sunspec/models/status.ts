import {
    registersToUint16,
    registersToAcc64BigInt,
    registersToSunssfNullable,
    registersToUint16Nullable,
    registersToUint32Nullable,
    registersToStringNullable,
    registersToInt16Nullable,
    registersToId,
} from '../../modbus/helpers/converters.js';
import { modbusModelFactory } from '../../modbus/modbusModelFactory.js';

// generated from SunSpec_Information_Model_Reference_20240701.xlsx

/**
 * Status
 *
 * Inverter Controls Extended Measurements and Status
 */
export type StatusModel = {
    /**
     * Model ID
     *
     * Model identifier
     */
    ID: 122;

    /**
     * Model Length
     *
     * Model length
     */
    L: number;

    /**
     * PVConn
     *
     * PV inverter present/available status. Enumerated value.
     */
    PVConn: PVConn;

    /**
     * StorConn
     *
     * Storage inverter present/available status. Enumerated value.
     */
    StorConn: StorConn;

    /**
     * ECPConn
     *
     * ECP connection status: disconnected=0 connected=1.
     */
    ECPConn: ECPConn;

    /**
     * ActWh
     *
     * AC lifetime active (real) energy output.
     */
    ActWh: bigint;

    /**
     * ActVAh
     *
     * AC lifetime apparent energy output.
     */
    ActVAh: bigint;

    /**
     * ActVArhQ1
     *
     * AC lifetime reactive energy output in quadrant 1.
     */
    ActVArhQ1: bigint;

    /**
     * ActVArhQ2
     *
     * AC lifetime reactive energy output in quadrant 2.
     */
    ActVArhQ2: bigint;

    /**
     * ActVArhQ3
     *
     * AC lifetime negative energy output in quadrant 3.
     */
    ActVArhQ3: bigint;

    /**
     * ActVArhQ4
     *
     * AC lifetime reactive energy output in quadrant 4.
     */
    ActVArhQ4: bigint;

    /**
     * VArAval
     *
     * Amount of VARs available without impacting watts output.
     */
    VArAval: number | null;

    /**
     * VArAval_SF
     *
     * Scale factor for available VARs.
     */
    VArAval_SF: number | null;

    /**
     * WAval
     *
     * Amount of Watts available.
     */
    WAval: number | null;

    /**
     * WAval_SF
     *
     * Scale factor for available Watts.
     */
    WAval_SF: number | null;

    /**
     * StSetLimMsk
     *
     * Bit Mask indicating setpoint limit(s) reached.
     */
    StSetLimMsk: StSetLimMsk | null;

    /**
     * StActCtl
     *
     * Bit Mask indicating which inverter controls are currently active.
     */
    StActCtl: StActCtl | null;

    /**
     * TmSrc
     *
     * Source of time synchronization.
     */
    TmSrc: string | null;

    /**
     * Tms
     *
     * Seconds since 01-01-2000 00:00 UTC.
     */
    Tms: number | null;

    /**
     * RtSt
     *
     * Bit Mask indicating active ride-through status.
     */
    RtSt: RtSt | null;

    /**
     * Ris
     *
     * Isolation resistance.
     */
    Ris: number | null;

    /**
     * Ris_SF
     *
     * Scale factor for isolation resistance.
     */
    Ris_SF: number | null;
};

export const statusModel = modbusModelFactory<StatusModel>({
    name: 'status',
    mapping: {
        ID: {
            start: 0,
            end: 1,
            readConverter: (value) => registersToId(value, 122),
        },
        L: {
            start: 1,
            end: 2,
            readConverter: registersToUint16,
        },
        PVConn: {
            start: 2,
            end: 3,
            readConverter: registersToUint16,
        },
        StorConn: {
            start: 3,
            end: 4,
            readConverter: registersToUint16,
        },
        ECPConn: {
            start: 4,
            end: 5,
            readConverter: registersToUint16,
        },
        ActWh: {
            start: 5,
            end: 9,
            readConverter: registersToAcc64BigInt,
        },
        ActVAh: {
            start: 9,
            end: 13,
            readConverter: registersToAcc64BigInt,
        },
        ActVArhQ1: {
            start: 13,
            end: 17,
            readConverter: registersToAcc64BigInt,
        },
        ActVArhQ2: {
            start: 17,
            end: 21,
            readConverter: registersToAcc64BigInt,
        },
        ActVArhQ3: {
            start: 21,
            end: 25,
            readConverter: registersToAcc64BigInt,
        },
        ActVArhQ4: {
            start: 25,
            end: 29,
            readConverter: registersToAcc64BigInt,
        },
        VArAval: {
            start: 29,
            end: 30,
            readConverter: registersToInt16Nullable,
        },
        VArAval_SF: {
            start: 30,
            end: 31,
            readConverter: registersToSunssfNullable,
        },
        WAval: {
            start: 31,
            end: 32,
            readConverter: registersToUint16Nullable,
        },
        WAval_SF: {
            start: 32,
            end: 33,
            readConverter: registersToSunssfNullable,
        },
        StSetLimMsk: {
            start: 33,
            end: 35,
            readConverter: registersToUint32Nullable,
        },
        StActCtl: {
            start: 35,
            end: 37,
            readConverter: registersToUint32Nullable,
        },
        TmSrc: {
            start: 37,
            end: 41,
            readConverter: registersToStringNullable,
        },
        Tms: {
            start: 41,
            end: 43,
            readConverter: registersToUint32Nullable,
        },
        RtSt: {
            start: 43,
            end: 44,
            readConverter: registersToUint16Nullable,
        },
        Ris: {
            start: 44,
            end: 45,
            readConverter: registersToUint16Nullable,
        },
        Ris_SF: {
            start: 45,
            end: 46,
            readConverter: registersToSunssfNullable,
        },
    },
});

/**
 * PVConn Enumeration
 *
 * Bitmask values representing PV inverter present/available status.
 */
export enum PVConn {
    CONNECTED = 1 << 0,
    AVAILABLE = 1 << 1,
    OPERATING = 1 << 2,
    TEST = 1 << 3,
}

/**
 * StorConn Enumeration
 *
 * Bitmask values representing Storage inverter present/available status.
 */
export enum StorConn {
    CONNECTED = 1 << 0,
    AVAILABLE = 1 << 1,
    OPERATING = 1 << 2,
    TEST = 1 << 3,
}

/**
 * ECPConn Enumeration
 *
 * Enumerated values representing ECP connection status.
 */
export enum ECPConn {
    DISCONNECTED = 0,
    CONNECTED = 1 << 0,
}

/**
 * StSetLimMsk Enumeration
 *
 * Bitmask values indicating setpoint limits reached.
 */
export enum StSetLimMsk {
    WMax = 1 << 0,
    VAMax = 1 << 1,
    VArAval = 1 << 2,
    VArMaxQ1 = 1 << 3,
    VArMaxQ2 = 1 << 4,
    VArMaxQ3 = 1 << 5,
    VArMaxQ4 = 1 << 6,
    PFMinQ1 = 1 << 7,
    PFMinQ2 = 1 << 8,
    PFMinQ3 = 1 << 9,
    PFMinQ4 = 1 << 10,
}

/**
 * StActCtl Enumeration
 *
 * Bitmask values indicating which inverter controls are currently active.
 */
export enum StActCtl {
    FixedW = 1 << 0,
    FixedVAR = 1 << 1,
    FixedPF = 1 << 2,
    VoltVAr = 1 << 3,
    FreqWattParam = 1 << 4,
    FreqWattCurve = 1 << 5,
    DynReactiveCurrent = 1 << 6,
    LVRT = 1 << 7,
    HVRT = 1 << 8,
    WattPF = 1 << 9,
    VoltWatt = 1 << 10,
    Scheduled = 1 << 12,
    LFRT = 1 << 13,
    HFRT = 1 << 14,
}

/**
 * RtSt Enumeration
 *
 * Bitmask values indicating active ride-through status.
 */
export enum RtSt {
    LVRT_ACTIVE = 1 << 0,
    HVRT_ACTIVE = 1 << 1,
    LFRT_ACTIVE = 1 << 2,
    HFRT_ACTIVE = 1 << 3,
}
