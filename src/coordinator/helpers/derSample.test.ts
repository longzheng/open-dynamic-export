import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { InverterEvent1 } from '../../sunspec/models/inverter.js';
import {
    InverterState,
    type InverterModel,
} from '../../sunspec/models/inverter.js';
import { generateDerSample } from './derSample.js';

describe('generateDerSample', () => {
    beforeEach(() => {
        // tell vitest we use mocked time
        vi.useFakeTimers();
    });

    afterEach(() => {
        // restoring date after each test run
        vi.useRealTimers();
    });

    it('should return a DerSample for a single inverter', () => {
        const now = new Date('2023-01-01T10:05:00Z');
        vi.setSystemTime(now);

        const inverters: InverterModel[] = [
            {
                ID: 103,
                L: 50,
                A: 3051,
                AphA: 1016,
                AphB: 1017,
                AphC: 1018,
                A_SF: -2,
                PPVphAB: 39600,
                PPVphBC: 39500,
                PPVphCA: 39920,
                PhVphA: 23010,
                PhVphB: 22770,
                PhVphC: 22900,
                V_SF: -2,
                W: 6990,
                W_SF: 0,
                Hz: 4999,
                Hz_SF: -2,
                VA: 6990,
                VA_SF: 0,
                VAr: -2500,
                VAr_SF: -2,
                PF: 10000,
                PF_SF: -2,
                WH: 77877496,
                WH_SF: 0,
                DCA: null,
                DCA_SF: null,
                DCV: null,
                DCV_SF: null,
                DCW: 7347,
                DCW_SF: 0,
                TmpCab: null,
                TmpSnk: null,
                TmpTrns: null,
                TmpOt: null,
                Tmp_SF: null,
                St: InverterState.MPPT,
                StVnd: 4,
                Evt1: 0 as InverterEvent1,
                Evt2: 0,
                EvtVnd1: 0,
                EvtVnd2: 0,
                EvtVnd3: 0,
                EvtVnd4: 0,
            },
        ];

        const result = generateDerSample({ inverters });

        expect(result).toStrictEqual({
            date: now,
            realPower: {
                type: 'noPhase',
                value: 6990,
            },
            reactivePower: {
                type: 'noPhase',
                value: -25,
            },
            voltage: {
                type: 'perPhase',
                phaseA: 230.1,
                phaseB: 227.7,
                phaseC: 229.0,
            },
            frequency: 49.99,
        });
    });

    it('should return a DerSample for a multiple inverters', () => {
        const now = new Date('2023-01-01T10:05:00Z');
        vi.setSystemTime(now);

        const inverters: InverterModel[] = [
            {
                ID: 103,
                L: 50,
                A: 3051,
                AphA: 1016,
                AphB: 1017,
                AphC: 1018,
                A_SF: -2,
                PPVphAB: 39600,
                PPVphBC: 39500,
                PPVphCA: 39920,
                PhVphA: 23010,
                PhVphB: 22770,
                PhVphC: 22900,
                V_SF: -2,
                W: 6990,
                W_SF: 0,
                Hz: 4999,
                Hz_SF: -2,
                VA: 6990,
                VA_SF: 0,
                VAr: -2500,
                VAr_SF: -2,
                PF: 10000,
                PF_SF: -2,
                WH: 77877496,
                WH_SF: 0,
                DCA: null,
                DCA_SF: null,
                DCV: null,
                DCV_SF: null,
                DCW: 7347,
                DCW_SF: 0,
                TmpCab: null,
                TmpSnk: null,
                TmpTrns: null,
                TmpOt: null,
                Tmp_SF: null,
                St: InverterState.MPPT,
                StVnd: 4,
                Evt1: 0 as InverterEvent1,
                Evt2: 0,
                EvtVnd1: 0,
                EvtVnd2: 0,
                EvtVnd3: 0,
                EvtVnd4: 0,
            },
            {
                ID: 101,
                L: 50,
                A: 3051,
                AphA: 1016,
                AphB: null,
                AphC: null,
                A_SF: -2,
                PPVphAB: 39600,
                PPVphBC: null,
                PPVphCA: null,
                PhVphA: 23010,
                PhVphB: null,
                PhVphC: null,
                V_SF: -2,
                W: 6990,
                W_SF: 0,
                Hz: 50,
                Hz_SF: 0,
                VA: 6990,
                VA_SF: 0,
                VAr: -2500,
                VAr_SF: -2,
                PF: 10000,
                PF_SF: -2,
                WH: 77877496,
                WH_SF: 0,
                DCA: null,
                DCA_SF: null,
                DCV: null,
                DCV_SF: null,
                DCW: 7347,
                DCW_SF: 0,
                TmpCab: null,
                TmpSnk: null,
                TmpTrns: null,
                TmpOt: null,
                Tmp_SF: null,
                St: InverterState.MPPT,
                StVnd: 4,
                Evt1: 0 as InverterEvent1,
                Evt2: 0,
                EvtVnd1: 0,
                EvtVnd2: 0,
                EvtVnd3: 0,
                EvtVnd4: 0,
            },
        ];

        const result = generateDerSample({ inverters });

        expect(result).toStrictEqual({
            date: now,
            realPower: {
                type: 'noPhase',
                value: 13980,
            },
            reactivePower: {
                type: 'noPhase',
                value: -50,
            },
            voltage: {
                type: 'perPhase',
                phaseA: 230.1,
                phaseB: null,
                phaseC: null,
            },
            frequency: 49.995,
        });
    });
});
