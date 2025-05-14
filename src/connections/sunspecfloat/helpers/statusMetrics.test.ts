import { describe, expect, it } from 'vitest';
import {
    type ECPConn,
    type PVConn,
    type StActCtl,
    type StatusModel,
    type StorConn,
} from '../models/status.js';
import { getStatusMetrics } from './statusMetrics.js';

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
