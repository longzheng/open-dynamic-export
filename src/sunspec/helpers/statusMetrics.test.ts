import { describe, expect, it } from 'vitest';
import type {
    ECPConn,
    PVConn,
    StActCtl,
    StatusModel,
    StorConn,
} from '../models/status';
import { getAggregatedStatusMetrics, getStatusMetrics } from './statusMetrics';

describe('getStatusMetrics', () => {
    it('returns data', () => {
        const status: StatusModel = {
            ActVAh: 0n,
            ActVArhQ1: 0n,
            ActVArhQ2: 0n,
            ActVArhQ3: 0n,
            ActVArhQ4: 0n,
            ActWh: 18798020n,
            ECPConn: 0 as ECPConn,
            ID: 122,
            L: 44,
            PVConn: 6 as PVConn,
            Ris: null,
            Ris_SF: null,
            RtSt: null,
            StActCtl: 0 as StActCtl,
            StSetLimMsk: null,
            StorConn: 0 as StorConn,
            TmSrc: 'RTC',
            Tms: 776799921,
            VArAval: null,
            VArAval_SF: null,
            WAval: null,
            WAval_SF: null,
        };

        const result = getStatusMetrics(status);

        expect(result).toStrictEqual({
            ActVAh: 0n,
            ActVArhQ1: 0n,
            ActVArhQ2: 0n,
            ActVArhQ3: 0n,
            ActVArhQ4: 0n,
            ActWh: 18798020n,
            ECPConn: 0 as ECPConn,
            PVConn: 6 as PVConn,
            StorConn: 0 as StorConn,
            VArAval: null,
            WAval: null,
        } satisfies ReturnType<typeof getStatusMetrics>);
    });
});

describe('getAggregatedStatusMetrics', () => {
    it('returns data', () => {
        const statuses: StatusModel[] = [
            {
                ActVAh: 0n,
                ActVArhQ1: 0n,
                ActVArhQ2: 0n,
                ActVArhQ3: 0n,
                ActVArhQ4: 0n,
                ActWh: 18798020n,
                ECPConn: 0 as ECPConn,
                ID: 122,
                L: 44,
                PVConn: 6 as PVConn,
                Ris: null,
                Ris_SF: null,
                RtSt: null,
                StActCtl: 0 as StActCtl,
                StSetLimMsk: null,
                StorConn: 0 as StorConn,
                TmSrc: 'RTC',
                Tms: 776799921,
                VArAval: null,
                VArAval_SF: null,
                WAval: null,
                WAval_SF: null,
            },
            {
                ActVAh: 0n,
                ActVArhQ1: 0n,
                ActVArhQ2: 0n,
                ActVArhQ3: 0n,
                ActVArhQ4: 0n,
                ActWh: 19508690n,
                ECPConn: 0 as ECPConn,
                ID: 122,
                L: 44,
                PVConn: 6 as PVConn,
                Ris: null,
                Ris_SF: null,
                RtSt: null,
                StActCtl: 0 as StActCtl,
                StSetLimMsk: null,
                StorConn: 0 as StorConn,
                TmSrc: 'RTC',
                Tms: 776799923,
                VArAval: null,
                VArAval_SF: null,
                WAval: null,
                WAval_SF: null,
            },
        ];

        const result = getAggregatedStatusMetrics(statuses);

        expect(result).toStrictEqual({
            ActVAh: 0n,
            ActVArhQ1: 0n,
            ActVArhQ2: 0n,
            ActVArhQ3: 0n,
            ActVArhQ4: 0n,
            ActWh: 38306710n,
            ECPConn: 0 as ECPConn,
            PVConn: 6 as PVConn,
            StorConn: 0 as StorConn,
            VArAval: null,
            WAval: null,
        } satisfies ReturnType<typeof getAggregatedStatusMetrics>);
    });

    it('returns higher PVConn', () => {
        const statuses: StatusModel[] = [
            {
                ActVAh: 0n,
                ActVArhQ1: 0n,
                ActVArhQ2: 0n,
                ActVArhQ3: 0n,
                ActVArhQ4: 0n,
                ActWh: 18798020n,
                ECPConn: 0 as ECPConn,
                ID: 122,
                L: 44,
                PVConn: 1 as PVConn,
                Ris: null,
                Ris_SF: null,
                RtSt: null,
                StActCtl: 0 as StActCtl,
                StSetLimMsk: null,
                StorConn: 0 as StorConn,
                TmSrc: 'RTC',
                Tms: 776799921,
                VArAval: null,
                VArAval_SF: null,
                WAval: null,
                WAval_SF: null,
            },
            {
                ActVAh: 0n,
                ActVArhQ1: 0n,
                ActVArhQ2: 0n,
                ActVArhQ3: 0n,
                ActVArhQ4: 0n,
                ActWh: 19508690n,
                ECPConn: 0 as ECPConn,
                ID: 122,
                L: 44,
                PVConn: 6 as PVConn,
                Ris: null,
                Ris_SF: null,
                RtSt: null,
                StActCtl: 0 as StActCtl,
                StSetLimMsk: null,
                StorConn: 0 as StorConn,
                TmSrc: 'RTC',
                Tms: 776799923,
                VArAval: null,
                VArAval_SF: null,
                WAval: null,
                WAval_SF: null,
            },
        ];

        const result = getAggregatedStatusMetrics(statuses);

        expect(result.PVConn).toStrictEqual(6);
    });
});