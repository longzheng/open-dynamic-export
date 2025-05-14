import { expect, it } from 'vitest';
import {
    type InverterEvent1,
    type InverterModelfloat,
} from '../models/inverter.js';
import { InverterState } from '../models/inverter.js';
import { getInverterMetrics } from './inverterMetrics.js';

it('getInverterMetrics returns data', () => {
    const inverter: InverterModelfloat = {
        ID: 113,
        L: 50,
        A: 3051,
        AphA: 1016,
        AphB: 1017,
        AphC: 1018,
        PPVphAB: 39600,
        PPVphBC: 39500,
        PPVphCA: 39920,
        PhVphA: 23010,
        PhVphB: 22770,
        PhVphC: 22900,
        W: 6990,
        Hz: 4999,
        VA: 6990,
        VAr: -2500,
        PF: 10000,
        WH: 77877496,
        DCA: null,
        DCV: null,
        DCW: 7347,
        TmpCab: null,
        TmpSnk: null,
        TmpTrns: null,
        TmpOt: null,
        St: InverterState.MPPT,
        StVnd: 4,
        Evt1: 0 as InverterEvent1,
        Evt2: 0,
        EvtVnd1: 0,
        EvtVnd2: 0,
        EvtVnd3: 0,
        EvtVnd4: 0,
    };

    const result = getInverterMetrics(inverter);

    expect(result).toStrictEqual({
        A: 30.51,
        AphA: 10.16,
        AphB: 10.17,
        AphC: 10.18,
        DCA: null,
        DCV: null,
        DCW: 7347,
        Hz: 49.99,
        PF: 100,
        PPVphAB: 396,
        PPVphBC: 395,
        PPVphCA: 399.2,
        PhVphA: 230.1,
        PhVphB: 227.7,
        PhVphC: 229,
        VA: 6990,
        VAr: -25,
        W: 6990,
        WH: 77877496,
        phases: 'threePhase',
    } satisfies ReturnType<typeof getInverterMetrics>);
});
