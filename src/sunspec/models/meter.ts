import {
    registersToUint16,
    registersToInt16,
    registersToSunssf,
    registersToInt16Nullable,
    registersToSunssfNullable,
    registersToAcc32,
} from '../helpers/converters';
import type { SunSpecBrand } from '../brand';
import { sunSpecModelFactory } from './sunSpecModelFactory';

// https://sunspec.org/wp-content/uploads/2021/12/SunSpec_Information_Model_Reference_20211209.xlsx
export type MeterModel = {
    // Model identifier
    // 201: single phase, 202: split phase, 203: three phases
    ID: number;
    // Model length
    L: number;
    // AC Current
    A: number;
    // Phase A Current
    AphA: number;
    // Phase B Current
    AphB: number | null;
    // Phase C Current
    AphC: number | null;
    A_SF: number;
    // Line to Neutral AC Voltage (average of active phases)
    PhV: number | null;
    // Phase Voltage AN
    PhVphA: number | null;
    // Phase Voltage BN
    PhVphB: number | null;
    // Phase Voltage CN
    PhVphC: number | null;
    // Line to Line AC Voltage (average of active phases)
    PPV: number | null;
    // Phase Voltage AB
    PPVphAB: number | null;
    // Phase Voltage BC
    PPVphBC: number | null;
    // Phase Voltage CA
    PPVphCA: number | null;
    V_SF: number;
    // Frequency
    Hz: number;
    Hz_SF: number;
    // Total Real Power
    W: number;
    // Real Power phase A
    WphA: number | null;
    // Real Power phase B
    WphB: number | null;
    // Real Power phase C
    WphC: number | null;
    W_SF: number;
    // AC Apparent Power
    VA: number | null;
    // Apparent Power phase A
    VAphA: number | null;
    // Apparent Power phase B
    VAphB: number | null;
    // Apparent Power phase C
    VAphC: number | null;
    VA_SF: number | null;
    // Reactive Power
    VAR: number | null;
    // Reactive Power phase A
    VARphA: number | null;
    // Reactive Power phase B
    VARphB: number | null;
    // Reactive Power phase C
    VARphC: number | null;
    VAR_SF: number | null;
    // Power Factor
    PF: number | null;
    // Power Factor phase A
    PFphA: number | null;
    // Power Factor phase B
    PFphB: number | null;
    // Power Factor phase C
    PFphC: number | null;
    PF_SF: number | null;
    // Total Real Energy Exported
    TotWhExp: number;
    // Real Energy Exported phase A
    TotWhExpPhA: number | null;
    // Real Energy Exported phase B
    TotWhExpPhB: number | null;
    // Real Energy Exported phase C
    TotWhExpPhC: number | null;
    // Total Real Energy Imported
    TotWhImp: number;
    // Real Energy Imported phase A
    TotWhImpPhA: number | null;
    // Real Energy Imported phase B
    TotWhImpPhB: number | null;
    // Real Energy Imported phase C
    TotWhImpPhC: number | null;
    TotWh_SF: number;
    // Total Apparent Energy Exported
    TotVAhExp: number;
    // Apparent Energy Exported phase A
    TotVAhExpPhA: number | null;
    // Apparent Energy Exported phase B
    TotVAhExpPhB: number | null;
    // Apparent Energy Exported phase C
    TotVAhExpPhC: number | null;
    // Total Apparent Energy Imported
    TotVAhImp: number;
    // Apparent Energy Imported phase A
    TotVAhImpPhA: number | null;
    // Apparent Energy Imported phase B
    TotVAhImpPhB: number | null;
    // Apparent Energy Imported phase C
    TotVAhImpPhC: number | null;
    TotVAh_SF: number;
    // Total Reactive Energy Imported Quadrant 1
    TotVArhImpQ1: number;
    // Reactive Energy Imported Q1 phase A
    TotVArhImpQ1PhA: number | null;
    // Reactive Energy Imported Q1 phase B
    TotVArhImpQ1PhB: number | null;
    // Reactive Energy Imported Q1 phase C
    TotVArhImpQ1PhC: number | null;
    // Total Reactive Power Imported Quadrant 2
    TotVArhImpQ2: number;
    // Reactive Power Imported Q2 phase A
    TotVArhImpQ2PhA: number | null;
    // Reactive Power Imported Q2 phase B
    TotVArhImpQ2PhB: number | null;
    // Reactive Power Imported Q2 phase C
    TotVArhImpQ2PhC: number | null;
    // Total Reactive Power Exported Quadrant 3
    TotVArhExpQ3: number;
    // Reactive Power Exported Q3 phase A
    TotVArhExpQ3PhA: number | null;
    // Reactive Power Exported Q3 phase B
    TotVArhExpQ3PhB: number | null;
    // Reactive Power Exported Q3 phase C
    TotVArhExpQ3PhC: number | null;
    // Total Reactive Power Exported Quadrant 4
    TotVArhExpQ4: number;
    // Reactive Power Exported Q4 phase A
    TotVArhExpQ4PhA: number | null;
    // Reactive Power Exported Q4 phase B
    TotVArhExpQ4PhB: number | null;
    // Reactive Power Exported Q4 phase C
    TotVArhExpQ4PhC: number | null;
    TotVArh_SF: number;
    // Meter Event Flags
    Evt: MeterEvent;
};

export const meterModel = sunSpecModelFactory<MeterModel>({
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
        A: {
            start: 2,
            end: 3,
            readConverter: registersToInt16,
        },
        AphA: {
            start: 3,
            end: 4,
            readConverter: registersToInt16,
        },
        AphB: {
            start: 4,
            end: 5,
            readConverter: registersToInt16Nullable,
        },
        AphC: {
            start: 5,
            end: 6,
            readConverter: registersToInt16Nullable,
        },
        A_SF: {
            start: 6,
            end: 7,
            readConverter: registersToSunssf,
        },
        PhV: {
            start: 7,
            end: 8,
            readConverter: registersToInt16,
        },
        PhVphA: {
            start: 8,
            end: 9,
            readConverter: registersToInt16Nullable,
        },
        PhVphB: {
            start: 9,
            end: 10,
            readConverter: registersToInt16Nullable,
        },
        PhVphC: {
            start: 10,
            end: 11,
            readConverter: registersToInt16Nullable,
        },
        PPV: {
            start: 11,
            end: 12,
            readConverter: registersToInt16Nullable,
        },
        PPVphAB: {
            start: 12,
            end: 13,
            readConverter: registersToInt16Nullable,
        },
        PPVphBC: {
            start: 13,
            end: 14,
            readConverter: registersToInt16Nullable,
        },
        PPVphCA: {
            start: 14,
            end: 15,
            readConverter: registersToInt16Nullable,
        },
        V_SF: {
            start: 15,
            end: 16,
            readConverter: registersToSunssf,
        },
        Hz: {
            start: 16,
            end: 17,
            readConverter: registersToInt16,
        },
        Hz_SF: {
            start: 17,
            end: 18,
            readConverter: registersToSunssf,
        },
        W: {
            start: 18,
            end: 19,
            readConverter: registersToInt16,
        },
        WphA: {
            start: 19,
            end: 20,
            readConverter: registersToInt16Nullable,
        },
        WphB: {
            start: 20,
            end: 21,
            readConverter: registersToInt16Nullable,
        },
        WphC: {
            start: 21,
            end: 22,
            readConverter: registersToInt16Nullable,
        },
        W_SF: {
            start: 22,
            end: 23,
            readConverter: registersToSunssf,
        },
        VA: {
            start: 23,
            end: 24,
            readConverter: registersToInt16Nullable,
        },
        VAphA: {
            start: 24,
            end: 25,
            readConverter: registersToInt16Nullable,
        },
        VAphB: {
            start: 25,
            end: 26,
            readConverter: registersToInt16Nullable,
        },
        VAphC: {
            start: 26,
            end: 27,
            readConverter: registersToInt16Nullable,
        },
        VA_SF: {
            start: 27,
            end: 28,
            readConverter: registersToSunssfNullable,
        },
        VAR: {
            start: 28,
            end: 29,
            readConverter: registersToInt16Nullable,
        },
        VARphA: {
            start: 29,
            end: 30,
            readConverter: registersToInt16Nullable,
        },
        VARphB: {
            start: 30,
            end: 31,
            readConverter: registersToInt16Nullable,
        },
        VARphC: {
            start: 31,
            end: 32,
            readConverter: registersToInt16Nullable,
        },
        VAR_SF: {
            start: 32,
            end: 33,
            readConverter: registersToSunssfNullable,
        },
        PF: {
            start: 33,
            end: 34,
            readConverter: registersToInt16Nullable,
        },
        PFphA: {
            start: 34,
            end: 35,
            readConverter: registersToInt16Nullable,
        },
        PFphB: {
            start: 35,
            end: 36,
            readConverter: registersToInt16Nullable,
        },
        PFphC: {
            start: 36,
            end: 37,
            readConverter: registersToInt16Nullable,
        },
        PF_SF: {
            start: 37,
            end: 38,
            readConverter: registersToSunssfNullable,
        },
        TotWhExp: {
            start: 38,
            end: 40,
            readConverter: registersToAcc32,
        },
        TotWhExpPhA: {
            start: 40,
            end: 42,
            readConverter: registersToAcc32,
        },
        TotWhExpPhB: {
            start: 42,
            end: 44,
            readConverter: registersToAcc32,
        },
        TotWhExpPhC: {
            start: 44,
            end: 46,
            readConverter: registersToAcc32,
        },
        TotWhImp: {
            start: 46,
            end: 48,
            readConverter: registersToAcc32,
        },
        TotWhImpPhA: {
            start: 48,
            end: 50,
            readConverter: registersToAcc32,
        },
        TotWhImpPhB: {
            start: 50,
            end: 52,
            readConverter: registersToAcc32,
        },
        TotWhImpPhC: {
            start: 52,
            end: 54,
            readConverter: registersToAcc32,
        },
        TotWh_SF: {
            start: 54,
            end: 55,
            readConverter: registersToSunssf,
        },
        TotVAhExp: {
            start: 55,
            end: 57,
            readConverter: registersToAcc32,
        },
        TotVAhExpPhA: {
            start: 57,
            end: 59,
            readConverter: registersToAcc32,
        },
        TotVAhExpPhB: {
            start: 59,
            end: 61,
            readConverter: registersToAcc32,
        },
        TotVAhExpPhC: {
            start: 61,
            end: 63,
            readConverter: registersToAcc32,
        },
        TotVAhImp: {
            start: 63,
            end: 65,
            readConverter: registersToAcc32,
        },
        TotVAhImpPhA: {
            start: 65,
            end: 67,
            readConverter: registersToAcc32,
        },
        TotVAhImpPhB: {
            start: 67,
            end: 69,
            readConverter: registersToAcc32,
        },
        TotVAhImpPhC: {
            start: 69,
            end: 71,
            readConverter: registersToAcc32,
        },
        TotVAh_SF: {
            start: 71,
            end: 72,
            readConverter: registersToSunssf,
        },
        TotVArhImpQ1: {
            start: 72,
            end: 74,
            readConverter: registersToAcc32,
        },
        TotVArhImpQ1PhA: {
            start: 74,
            end: 76,
            readConverter: registersToAcc32,
        },
        TotVArhImpQ1PhB: {
            start: 76,
            end: 78,
            readConverter: registersToAcc32,
        },
        TotVArhImpQ1PhC: {
            start: 78,
            end: 80,
            readConverter: registersToAcc32,
        },
        TotVArhImpQ2: {
            start: 80,
            end: 82,
            readConverter: registersToAcc32,
        },
        TotVArhImpQ2PhA: {
            start: 82,
            end: 84,
            readConverter: registersToAcc32,
        },
        TotVArhImpQ2PhB: {
            start: 84,
            end: 86,
            readConverter: registersToAcc32,
        },
        TotVArhImpQ2PhC: {
            start: 86,
            end: 88,
            readConverter: registersToAcc32,
        },
        TotVArhExpQ3: {
            start: 88,
            end: 90,
            readConverter: registersToAcc32,
        },
        TotVArhExpQ3PhA: {
            start: 90,
            end: 92,
            readConverter: registersToAcc32,
        },
        TotVArhExpQ3PhB: {
            start: 92,
            end: 94,
            readConverter: registersToAcc32,
        },
        TotVArhExpQ3PhC: {
            start: 94,
            end: 96,
            readConverter: registersToAcc32,
        },
        TotVArhExpQ4: {
            start: 96,
            end: 98,
            readConverter: registersToAcc32,
        },
        TotVArhExpQ4PhA: {
            start: 98,
            end: 100,
            readConverter: registersToAcc32,
        },
        TotVArhExpQ4PhB: {
            start: 100,
            end: 102,
            readConverter: registersToAcc32,
        },
        TotVArhExpQ4PhC: {
            start: 102,
            end: 104,
            readConverter: registersToAcc32,
        },
        TotVArh_SF: {
            start: 104,
            end: 105,
            readConverter: registersToSunssf,
        },
        Evt: {
            start: 105,
            end: 106,
            readConverter: registersToUint16,
        },
    },
});

export enum MeterEvent {
    PowerFailure = 2,
    UnderVoltage = 3,
    LowPF = 4,
    OverCurrent = 5,
    OverVoltage = 6,
    MissingSensor = 7,
    OEM01 = 16,
    OEM02 = 17,
    OEM03 = 18,
    OEM04 = 19,
    OEM05 = 20,
    OEM06 = 21,
    OEM07 = 22,
    OEM08 = 23,
    OEM09 = 24,
    OEM10 = 25,
    OEM11 = 26,
    OEM12 = 27,
    OEM13 = 28,
    OEM14 = 29,
    OEM15 = 30,
}

export function meterModelAddressStartByBrand(brand: SunSpecBrand) {
    switch (brand) {
        case 'fronius':
            return 40069;
        case 'sma':
            throw new Error('Not implemented');
        case 'solaredge':
            throw new Error('Not implemented');
    }
}
