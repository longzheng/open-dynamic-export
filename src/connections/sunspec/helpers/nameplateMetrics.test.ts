import { expect, it } from 'vitest';
import { getNameplateMetrics } from './nameplateMetrics.js';
import { type NameplateModel } from '../models/nameplate.js';

it('getNameplateMetrics returns data', () => {
    const nameplate: NameplateModel = {
        ARtg: 2080,
        ARtg_SF: -2,
        AhrRtg: null,
        AhrRtg_SF: null,
        DERTyp: 4,
        ID: 120,
        L: 26,
        MaxChaRte: null,
        MaxChaRte_SF: null,
        MaxDisChaRte: null,
        MaxDisChaRte_SF: null,
        PFRtgQ1: -800,
        PFRtgQ2: null,
        PFRtgQ3: null,
        PFRtgQ4: 800,
        PFRtg_SF: -3,
        VARtg: 500,
        VARtg_SF: 1,
        VArRtgQ1: 500,
        VArRtgQ2: null,
        VArRtgQ3: null,
        VArRtgQ4: -500,
        VArRtg_SF: 1,
        WHRtg: null,
        WHRtg_SF: null,
        WRtg: 500,
        WRtg_SF: 1,
    };

    const result = getNameplateMetrics(nameplate);

    expect(result).toStrictEqual({
        ARtg: 20.8,
        AhrRtg: null,
        DERTyp: 4,
        MaxChaRte: null,
        MaxDisChaRte: null,
        PFRtgQ1: -0.8,
        PFRtgQ2: null,
        PFRtgQ3: null,
        PFRtgQ4: 0.8,
        VARtg: 5000,
        VArRtgQ1: 5000,
        VArRtgQ2: null,
        VArRtgQ3: null,
        VArRtgQ4: -5000,
        WHRtg: null,
        WRtg: 5000,
    } satisfies ReturnType<typeof getNameplateMetrics>);
});
