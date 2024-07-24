import {
    registersToUint16,
    registersToAcc64BigInt,
    registersToSunssfNullable,
    registersToUint16Nullable,
    registersToUint32Nullable,
    registersToStringNullable,
} from '../helpers/converters';
import type { SunSpecBrand } from './brand';
import { sunSpecModelFactory } from './sunSpecModelFactory';

// https://sunspec.org/wp-content/uploads/2021/12/SunSpec_Information_Model_Reference_20211209.xlsx
export type StatusModel = {
    // Model identifier
    // 122 is Inverter Controls Extended Measurements and Status
    ID: number;
    // Model length
    L: number;
    // PV inverter present/available status. Enumerated value.
    PVConn: PVConn;
    // Storage inverter present/available status. Enumerated value.
    StorConn: StorConn;
    // ECP connection status: disconnected=0 connected=1.
    ECPConn: ECPConn;
    // AC lifetime active (real) energy output.
    ActWh: bigint;
    // AC lifetime apparent energy output.
    ActVAh: bigint;
    // AC lifetime reactive energy output in quadrant 1.
    ActVArhQ1: bigint;
    // AC lifetime reactive energy output in quadrant 2.
    ActVArhQ2: bigint;
    // AC lifetime negative energy output in quadrant 3.
    ActVArhQ3: bigint;
    // AC lifetime reactive energy output in quadrant 4.
    ActVArhQ4: bigint;
    // Amount of VARs available without impacting watts output.
    VArAval: number | null;
    // Scale factor for available VARs.
    VArAval_SF: number | null;
    // Amount of Watts available.
    WAval: number | null;
    // Scale factor for available Watts.
    WAval_SF: number | null;
    // Bit Mask indicating setpoint limit(s) reached.
    StSetLimMsk: StSetLimMsk | null;
    // Bit Mask indicating which inverter controls are currently active.
    StActCtl: StActCtl | null;
    // Source of time synchronization.
    TmSrc: string | null;
    // Seconds since 01-01-2000 00:00 UTC
    Tms: number | null;
    // Bit Mask indicating active ride-through status.
    RtSt: RtSt | null;
    // Isolation resistance.
    Ris: number | null;
    // Scale factor for isolation resistance.
    Ris_SF: number | null;
};

export const statusModel = sunSpecModelFactory<StatusModel>({
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
            readConverter: registersToUint16Nullable,
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

export function statusModelAddressStartByBrand(brand: SunSpecBrand) {
    switch (brand) {
        case 'fronius':
            return 40181;
        case 'sma':
            throw new Error('Not implemented');
        case 'solaredge':
            throw new Error('Not implemented');
    }
}

export enum PVConn {
    CONNECTED = 0,
    AVAILABLE = 1,
    OPERATING = 2,
    TEST = 3,
}

export enum StorConn {
    CONNECTED = 0,
    AVAILABLE = 1,
    OPERATING = 2,
    TEST = 3,
}

export enum ECPConn {
    CONNECTED = 0,
}

export enum StSetLimMsk {
    WMax = 0,
    VAMax = 1,
    VArAval = 2,
    VArMaxQ1 = 3,
    VArMaxQ2 = 4,
    VArMaxQ3 = 5,
    VArMaxQ4 = 6,
    PFMinQ1 = 7,
    PFMinQ2 = 8,
    PFMinQ3 = 9,
    PFMinQ4 = 10,
}

export enum StActCtl {
    FixedW = 0,
    FixedVAR = 1,
    FixedPF = 2,
    VoltVAr = 3,
    FreqWattParam = 4,
    FreqWattCurve = 5,
    DynReactiveCurrent = 6,
    LVRT = 7,
    HVRT = 8,
    WattPF = 9,
    VoltWatt = 10,
    Scheduled = 12,
    LFRT = 13,
    HFRT = 14,
}

export enum RtSt {
    LVRT_ACTIVE = 0,
    HVRT_ACTIVE = 1,
    LFRT_ACTIVE = 2,
    HFRT_ACTIVE = 3,
}
