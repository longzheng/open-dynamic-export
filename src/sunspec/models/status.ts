import {
    registersToUint16,
    registersToAcc64,
    registersToString,
    registersToUint32,
    registersToSunssf,
} from '../helpers/converters';
import type { SunSpecBrand } from './brand';
import { sunSpecModelFactory } from './sunSpecModelFactory';

// https://sunspec.org/wp-content/uploads/2021/12/SunSpec_Information_Model_Reference_20211209.xlsx
export type StatusModel = {
    // Model identifier
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
    ActWh: number;
    // AC lifetime apparent energy output.
    ActVAh: number;
    // AC lifetime reactive energy output in quadrant 1.
    ActVArhQ1: number;
    // AC lifetime reactive energy output in quadrant 2.
    ActVArhQ2: number;
    // AC lifetime negative energy output in quadrant 3.
    ActVArhQ3: number;
    // AC lifetime reactive energy output in quadrant 4.
    ActVArhQ4: number;
    // Amount of VARs available without impacting watts output.
    VArAval: number;
    // Scale factor for available VARs.
    VArAval_SF: number;
    // Amount of Watts available.
    WAval: number;
    // Scale factor for available Watts.
    WAval_SF: number;
    // Bit Mask indicating setpoint limit(s) reached.
    StSetLimMsk: StSetLimMsk;
    // Bit Mask indicating which inverter controls are currently active.
    StActCtl: StActCtl;
    // Source of time synchronization.
    TmSrc: string;
    // Seconds since 01-01-2000 00:00 UTC
    Tms: number;
    // Bit Mask indicating active ride-through status.
    RtSt: RtSt;
    // Isolation resistance.
    Ris: number;
    // Scale factor for isolation resistance.
    Ris_SF: number;
};

export const statusModel = sunSpecModelFactory<StatusModel>({
    addressLength: 46,
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
        PVConn: {
            start: 2,
            end: 3,
            converter: registersToUint16,
        },
        StorConn: {
            start: 3,
            end: 4,
            converter: registersToUint16,
        },
        ECPConn: {
            start: 4,
            end: 5,
            converter: registersToUint16,
        },
        ActWh: {
            start: 5,
            end: 9,
            converter: registersToAcc64,
        },
        ActVAh: {
            start: 9,
            end: 13,
            converter: registersToAcc64,
        },
        ActVArhQ1: {
            start: 13,
            end: 17,
            converter: registersToAcc64,
        },
        ActVArhQ2: {
            start: 17,
            end: 21,
            converter: registersToAcc64,
        },
        ActVArhQ3: {
            start: 21,
            end: 25,
            converter: registersToAcc64,
        },
        ActVArhQ4: {
            start: 25,
            end: 29,
            converter: registersToAcc64,
        },
        VArAval: {
            start: 29,
            end: 30,
            converter: registersToUint16,
        },
        VArAval_SF: {
            start: 30,
            end: 31,
            converter: registersToSunssf,
        },
        WAval: {
            start: 31,
            end: 32,
            converter: registersToUint16,
        },
        WAval_SF: {
            start: 32,
            end: 33,
            converter: registersToSunssf,
        },
        StSetLimMsk: {
            start: 33,
            end: 35,
            converter: registersToUint32,
        },
        StActCtl: {
            start: 35,
            end: 37,
            converter: registersToUint32,
        },
        TmSrc: {
            start: 37,
            end: 41,
            converter: registersToString,
        },
        Tms: {
            start: 41,
            end: 43,
            converter: registersToUint32,
        },
        RtSt: {
            start: 43,
            end: 44,
            converter: registersToUint16,
        },
        Ris: {
            start: 44,
            end: 45,
            converter: registersToUint16,
        },
        Ris_SF: {
            start: 45,
            end: 46,
            converter: registersToSunssf,
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
