import { expect, it } from 'vitest';
import { type MeterEvent, type MeterModel } from '../models/meter.js';
import { getMeterMetrics } from './meterMetrics.js';

it('getMeterMetrics returns data', () => {
    const meter: MeterModel = {
        ID: 203,
        L: 105,
        A: 591,
        AphA: 355,
        AphB: 104,
        AphC: 132,
        A_SF: -2,
        PhV: 2348,
        PhVphA: 2355,
        PhVphB: 2337,
        PhVphC: 2353,
        PPV: 4067,
        PPVphAB: 4063,
        PPVphBC: 4062,
        PPVphCA: 4077,
        V_SF: -1,
        Hz: 4990,
        Hz_SF: -2,
        W: -7508,
        WphA: -7392,
        WphB: 0,
        WphC: -116,
        W_SF: -1,
        VA: 9510,
        VAphA: 8350,
        VAphB: 2428,
        VAphC: 3096,
        VA_SF: -1,
        VAR: -5841,
        VARphA: -2033,
        VARphB: -1439,
        VARphC: -2368,
        VAR_SF: -1,
        PF: 78,
        PFphA: 96,
        PFphB: 0,
        PFphC: 4,
        PF_SF: 0,
        TotWhExp: 28260179,
        TotWhExpPhA: 0,
        TotWhExpPhB: 0,
        TotWhExpPhC: 0,
        TotWhImp: 45756700,
        TotWhImpPhA: 0,
        TotWhImpPhB: 0,
        TotWhImpPhC: 0,
        TotWh_SF: 0,
        TotVAhExp: 0,
        TotVAhExpPhA: 0,
        TotVAhExpPhB: 0,
        TotVAhExpPhC: 0,
        TotVAhImp: 0,
        TotVAhImpPhA: 0,
        TotVAhImpPhB: 0,
        TotVAhImpPhC: 0,
        TotVAh_SF: null,
        TotVArhImpQ1: 0,
        TotVArhImpQ1PhA: 0,
        TotVArhImpQ1PhB: 0,
        TotVArhImpQ1PhC: 0,
        TotVArhImpQ2: 0,
        TotVArhImpQ2PhA: 0,
        TotVArhImpQ2PhB: 0,
        TotVArhImpQ2PhC: 0,
        TotVArhExpQ3: 0,
        TotVArhExpQ3PhA: 0,
        TotVArhExpQ3PhB: 0,
        TotVArhExpQ3PhC: 0,
        TotVArhExpQ4: 0,
        TotVArhExpQ4PhA: 0,
        TotVArhExpQ4PhB: 0,
        TotVArhExpQ4PhC: 0,
        TotVArh_SF: null,
        Evt: 0 as MeterEvent,
    };

    const result = getMeterMetrics(meter);

    expect(result).toStrictEqual({
        phases: 'threePhase',
        A: 5.91,
        AphA: 3.55,
        AphB: 1.04,
        AphC: 1.32,
        Hz: 49.9,
        PF: 78,
        PFphA: 96,
        PFphB: 0,
        PFphC: 4,
        PPV: 406.7,
        PPVphAB: 406.3,
        PPVphBC: 406.2,
        PPVphCA: 407.7,
        PhV: 234.8,
        PhVphA: 235.5,
        PhVphB: 233.7,
        PhVphC: 235.3,
        VA: 951,
        VAR: -584.1,
        VARphA: -203.3,
        VARphB: -143.9,
        VARphC: -236.8,
        VAphA: 835,
        VAphB: 242.8,
        VAphC: 309.6,
        W: -750.8,
        WphA: -739.2,
        WphB: 0,
        WphC: -11.6,
    } satisfies ReturnType<typeof getMeterMetrics>);
});
