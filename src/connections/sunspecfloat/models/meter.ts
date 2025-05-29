import {
    registersToUint16,
    registersToId,
    registersToFloat32,
    registersToUint32,
} from '../../modbus/helpers/converters.js';
import { modbusModelFactory } from '../../modbus/modbusModelFactory.js';

// generated from SunSpec_Information_Model_Reference_20240701.xlsx

/**
 * Meter (Single Phase, Split-Phase, Three Phase)
 *
 * A combination of the three models for single phase, split-phase, and three phase meters
 */
export type MeterModelfloat = {
    /**
     * Model ID
     *
     * Model identifier.
     */
    ID: 211 | 212 | 213;

    /**
     * Model Length
     *
     * Model length.
     */
    L: number;

    /**
     * A
     *
     * Total AC Current.
     */
    A: number;

    /**
     * AphA
     *
     * Phase A Current.
     */
    AphA: number | null;

    /**
     * AphB
     *
     * Phase B Current.
     */
    AphB: number | null;

    /**
     * AphC
     *
     * Phase C Current.
     */
    AphC: number | null;

    /**
     * PhV
     *
     * Line to Neutral AC Voltage (average of active phases).
     */
    PhV: number | null;

    /**
     * PhVphA
     *
     * Phase Voltage AN.
     */
    PhVphA: number | null;

    /**
     * PhVphB
     *
     * Phase Voltage BN.
     */
    PhVphB: number | null;

    /**
     * PhVphC
     *
     * Phase Voltage CN.
     */
    PhVphC: number | null;

    /**
     * PPV
     *
     * Line to Line AC Voltage (average of active phases).
     */
    PPV: number | null;

    /**
     * PPVphAB
     *
     * Phase Voltage AB.
     */
    PPVphAB: number | null;

    /**
     * PPVphBC
     *
     * Phase Voltage BC.
     */
    PPVphBC: number | null;

    /**
     * PPVphCA
     *
     * Phase Voltage CA.
     */
    PPVphCA: number | null;

    /**
     * Hz
     *
     * Frequency.
     */
    Hz: number;

    /**
     * W
     *
     * Total Real Power.
     */
    W: number;

    /**
     * WphA
     *
     * Real Power phase A.
     */
    WphA: number | null;

    /**
     * WphB
     *
     * Real Power phase B.
     */
    WphB: number | null;

    /**
     * WphC
     *
     * Real Power phase C.
     */
    WphC: number | null;

    /**
     * VA
     *
     * AC Apparent Power.
     */
    VA: number | null;

    /**
     * VAphA
     *
     * Apparent Power phase A.
     */
    VAphA: number | null;

    /**
     * VAphB
     *
     * Apparent Power phase B.
     */
    VAphB: number | null;

    /**
     * VAphC
     *
     * Apparent Power phase C.
     */
    VAphC: number | null;

    /**
     * VAR
     *
     * Reactive Power.
     */
    VAR: number | null;

    /**
     * VARphA
     *
     * Reactive Power phase A.
     */
    VARphA: number | null;

    /**
     * VARphB
     *
     * Reactive Power phase B.
     */
    VARphB: number | null;

    /**
     * VARphC
     *
     * Reactive Power phase C.
     */
    VARphC: number | null;

    /**
     * PF
     *
     * Power Factor.
     */
    PF: number | null;

    /**
     * PFphA
     *
     * Power Factor phase A.
     */
    PFphA: number | null;

    /**
     * PFphB
     *
     * Power Factor phase B.
     */
    PFphB: number | null;

    /**
     * PFphC
     *
     * Power Factor phase C.
     */
    PFphC: number | null;

    /**
     * TotWhExp
     *
     * Total Real Energy Exported.
     */
    TotWhExp: number;

    /**
     * TotWhExpPhA
     *
     * Real Energy Exported phase A.
     */
    TotWhExpPhA: number | null;

    /**
     * TotWhExpPhB
     *
     * Real Energy Exported phase B.
     */
    TotWhExpPhB: number | null;

    /**
     * TotWhExpPhC
     *
     * Real Energy Exported phase C.
     */
    TotWhExpPhC: number | null;

    /**
     * TotWhImp
     *
     * Total Real Energy Imported.
     */
    TotWhImp: number;

    /**
     * TotWhImpPhA
     *
     * Real Energy Imported phase A.
     */
    TotWhImpPhA: number | null;

    /**
     * TotWhImpPhB
     *
     * Real Energy Imported phase B.
     */
    TotWhImpPhB: number | null;

    /**
     * TotWhImpPhC
     *
     * Real Energy Imported phase C.
     */
    TotWhImpPhC: number | null;

    /**
     * TotVAhExp
     *
     * Total Apparent Energy Exported.
     */
    TotVAhExp: number;

    /**
     * TotVAhExpPhA
     *
     * Apparent Energy Exported phase A.
     */
    TotVAhExpPhA: number | null;

    /**
     * TotVAhExpPhB
     *
     * Apparent Energy Exported phase B.
     */
    TotVAhExpPhB: number | null;

    /**
     * TotVAhExpPhC
     *
     * Apparent Energy Exported phase C.
     */
    TotVAhExpPhC: number | null;

    /**
     * TotVAhImp
     *
     * Total Apparent Energy Imported.
     */
    TotVAhImp: number;

    /**
     * TotVAhImpPhA
     *
     * Apparent Energy Imported phase A.
     */
    TotVAhImpPhA: number | null;

    /**
     * TotVAhImpPhB
     *
     * Apparent Energy Imported phase B.
     */
    TotVAhImpPhB: number | null;

    /**
     * TotVAhImpPhC
     *
     * Apparent Energy Imported phase C.
     */
    TotVAhImpPhC: number | null;

    /**
     * TotVArhImpQ1
     *
     * Total Reactive Energy Imported Quadrant 1.
     */
    TotVArhImpQ1: number;

    /**
     * TotVArhImpQ1PhA
     *
     * Reactive Energy Imported Q1 phase A.
     */
    TotVArhImpQ1PhA: number | null;

    /**
     * TotVArhImpQ1PhB
     *
     * Reactive Energy Imported Q1 phase B.
     */
    TotVArhImpQ1PhB: number | null;

    /**
     * TotVArhImpQ1PhC
     *
     * Reactive Energy Imported Q1 phase C.
     */
    TotVArhImpQ1PhC: number | null;

    /**
     * TotVArhImpQ2
     *
     * Total Reactive Power Imported Quadrant 2.
     */
    TotVArhImpQ2: number;

    /**
     * TotVArhImpQ2PhA
     *
     * Reactive Power Imported Q2 phase A.
     */
    TotVArhImpQ2PhA: number | null;

    /**
     * TotVArhImpQ2PhB
     *
     * Reactive Power Imported Q2 phase B.
     */
    TotVArhImpQ2PhB: number | null;

    /**
     * TotVArhImpQ2PhC
     *
     * Reactive Power Imported Q2 phase C.
     */
    TotVArhImpQ2PhC: number | null;

    /**
     * TotVArhExpQ3
     *
     * Total Reactive Power Exported Quadrant 3.
     */
    TotVArhExpQ3: number;

    /**
     * TotVArhExpQ3PhA
     *
     * Reactive Power Exported Q3 phase A.
     */
    TotVArhExpQ3PhA: number | null;

    /**
     * TotVArhExpQ3PhB
     *
     * Reactive Power Exported Q3 phase B.
     */
    TotVArhExpQ3PhB: number | null;

    /**
     * TotVArhExpQ3PhC
     *
     * Reactive Power Exported Q3 phase C.
     */
    TotVArhExpQ3PhC: number | null;

    /**
     * TotVArhExpQ4
     *
     * Total Reactive Power Exported Quadrant 4.
     */
    TotVArhExpQ4: number;

    /**
     * TotVArhExpQ4PhA
     *
     * Reactive Power Exported Q4 phase A.
     */
    TotVArhExpQ4PhA: number | null;

    /**
     * TotVArhExpQ4PhB
     *
     * Reactive Power Exported Q4 phase B.
     */
    TotVArhExpQ4PhB: number | null;

    /**
     * TotVArhExpQ4PhC
     *
     * Reactive Power Exported Q4 phase C.
     */
    TotVArhExpQ4PhC: number | null;

    /**
     * Evt
     *
     * Meter Event Flags.
     */
    Evt: MeterEvent;
};

export const meterModelfloat = modbusModelFactory<MeterModelfloat>({
    name: 'meter',
    mapping: {
        ID: {
            start: 0,
            end: 1,
            readConverter: (value) => registersToId(value, [211, 212, 213]),
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
        PhV: {
            start: 10,
            end: 12,
            readConverter: registersToFloat32,
        },
        PhVphA: {
            start: 12,
            end: 14,
            readConverter: registersToFloat32,
        },
        PhVphB: {
            start: 14,
            end: 16,
            readConverter: registersToFloat32,
        },
        PhVphC: {
            start: 16,
            end: 18,
            readConverter: registersToFloat32,
        },
        PPV: {
            start: 18,
            end: 20,
            readConverter: registersToFloat32,
        },
        PPVphAB: {
            start: 20,
            end: 22,
            readConverter: registersToFloat32,
        },
        PPVphBC: {
            start: 22,
            end: 24,
            readConverter: registersToFloat32,
        },
        PPVphCA: {
            start: 24,
            end: 26,
            readConverter: registersToFloat32,
        },
        Hz: {
            start: 26,
            end: 28,
            readConverter: registersToFloat32,
        },
        W: {
            start: 28,
            end: 30,
            readConverter: registersToFloat32,
        },
        WphA: {
            start: 30,
            end: 32,
            readConverter: registersToFloat32,
        },
        WphB: {
            start: 32,
            end: 34,
            readConverter: registersToFloat32,
        },
        WphC: {
            start: 34,
            end: 36,
            readConverter: registersToFloat32,
        },
        VA: {
            start: 36,
            end: 38,
            readConverter: registersToFloat32,
        },
        VAphA: {
            start: 38,
            end: 40,
            readConverter: registersToFloat32,
        },
        VAphB: {
            start: 40,
            end: 42,
            readConverter: registersToFloat32,
        },
        VAphC: {
            start: 42,
            end: 44,
            readConverter: registersToFloat32,
        },
        VAR: {
            start: 44,
            end: 46,
            readConverter: registersToFloat32,
        },
        VARphA: {
            start: 46,
            end: 48,
            readConverter: registersToFloat32,
        },
        VARphB: {
            start: 48,
            end: 50,
            readConverter: registersToFloat32,
        },
        VARphC: {
            start: 50,
            end: 52,
            readConverter: registersToFloat32,
        },
        PF: {
            start: 52,
            end: 54,
            readConverter: registersToFloat32,
        },
        PFphA: {
            start: 54,
            end: 56,
            readConverter: registersToFloat32,
        },
        PFphB: {
            start: 56,
            end: 58,
            readConverter: registersToFloat32,
        },
        PFphC: {
            start: 58,
            end: 60,
            readConverter: registersToFloat32,
        },
        TotWhExp: {
            start: 60,
            end: 62,
            readConverter: registersToFloat32,
        },
        TotWhExpPhA: {
            start: 62,
            end: 64,
            readConverter: registersToFloat32,
        },
        TotWhExpPhB: {
            start: 64,
            end: 66,
            readConverter: registersToFloat32,
        },
        TotWhExpPhC: {
            start: 66,
            end: 68,
            readConverter: registersToFloat32,
        },
        TotWhImp: {
            start: 68,
            end: 70,
            readConverter: registersToFloat32,
        },
        TotWhImpPhA: {
            start: 70,
            end: 72,
            readConverter: registersToFloat32,
        },
        TotWhImpPhB: {
            start: 72,
            end: 74,
            readConverter: registersToFloat32,
        },
        TotWhImpPhC: {
            start: 74,
            end: 76,
            readConverter: registersToFloat32,
        },
        TotVAhExp: {
            start: 76,
            end: 78,
            readConverter: registersToFloat32,
        },
        TotVAhExpPhA: {
            start: 78,
            end: 80,
            readConverter: registersToFloat32,
        },
        TotVAhExpPhB: {
            start: 80,
            end: 82,
            readConverter: registersToFloat32,
        },
        TotVAhExpPhC: {
            start: 82,
            end: 84,
            readConverter: registersToFloat32,
        },
        TotVAhImp: {
            start: 84,
            end: 86,
            readConverter: registersToFloat32,
        },
        TotVAhImpPhA: {
            start: 86,
            end: 88,
            readConverter: registersToFloat32,
        },
        TotVAhImpPhB: {
            start: 88,
            end: 90,
            readConverter: registersToFloat32,
        },
        TotVAhImpPhC: {
            start: 90,
            end: 92,
            readConverter: registersToFloat32,
        },
        TotVArhImpQ1: {
            start: 92,
            end: 94,
            readConverter: registersToFloat32,
        },
        TotVArhImpQ1PhA: {
            start: 94,
            end: 96,
            readConverter: registersToFloat32,
        },
        TotVArhImpQ1PhB: {
            start: 96,
            end: 98,
            readConverter: registersToFloat32,
        },
        TotVArhImpQ1PhC: {
            start: 98,
            end: 100,
            readConverter: registersToFloat32,
        },
        TotVArhImpQ2: {
            start: 100,
            end: 102,
            readConverter: registersToFloat32,
        },
        TotVArhImpQ2PhA: {
            start: 102,
            end: 104,
            readConverter: registersToFloat32,
        },
        TotVArhImpQ2PhB: {
            start: 104,
            end: 106,
            readConverter: registersToFloat32,
        },
        TotVArhImpQ2PhC: {
            start: 106,
            end: 108,
            readConverter: registersToFloat32,
        },
        TotVArhExpQ3: {
            start: 108,
            end: 110,
            readConverter: registersToFloat32,
        },
        TotVArhExpQ3PhA: {
            start: 110,
            end: 112,
            readConverter: registersToFloat32,
        },
        TotVArhExpQ3PhB: {
            start: 112,
            end: 114,
            readConverter: registersToFloat32,
        },
        TotVArhExpQ3PhC: {
            start: 114,
            end: 116,
            readConverter: registersToFloat32,
        },
        TotVArhExpQ4: {
            start: 116,
            end: 118,
            readConverter: registersToFloat32,
        },
        TotVArhExpQ4PhA: {
            start: 118,
            end: 120,
            readConverter: registersToFloat32,
        },
        TotVArhExpQ4PhB: {
            start: 120,
            end: 122,
            readConverter: registersToFloat32,
        },
        TotVArhExpQ4PhC: {
            start: 122,
            end: 124,
            readConverter: registersToFloat32,
        },
        Evt: {
            start: 124,
            end: 125,
            readConverter: registersToUint16,
        },
    },
});

/**
 * MeterEvent Enumeration
 *
 * Bitmask values representing Meter Event Flags.
 */
export enum MeterEvent {
    PowerFailure = 1 << 2,
    UnderVoltage = 1 << 3,
    LowPF = 1 << 4,
    OverCurrent = 1 << 5,
    OverVoltage = 1 << 6,
    MissingSensor = 1 << 7,
    OEM01 = 1 << 16,
    OEM02 = 1 << 17,
    OEM03 = 1 << 18,
    OEM04 = 1 << 19,
    OEM05 = 1 << 20,
    OEM06 = 1 << 21,
    OEM07 = 1 << 22,
    OEM08 = 1 << 23,
    OEM09 = 1 << 24,
    OEM10 = 1 << 25,
    OEM11 = 1 << 26,
    OEM12 = 1 << 27,
    OEM13 = 1 << 28,
    OEM14 = 1 << 29,
    OEM15 = 1 << 30,
}
