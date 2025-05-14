import { expect, it } from 'vitest';
import { type SettingsModel } from '../models/settings.js';
import { getSettingsMetrics } from './settingsMetrics.js';

it('getSettingsMetrics returns data', () => {
    const settings: SettingsModel = {
        ClcTotVA: null,
        ConnPh: null,
        ECPNomHz: null,
        ECPNomHz_SF: null,
        ID: 121,
        L: 30,
        MaxRmpRte: null,
        MaxRmpRte_SF: null,
        PFMinQ1: -800,
        PFMinQ2: null,
        PFMinQ3: null,
        PFMinQ4: 800,
        PFMin_SF: -3,
        VAMax: 500,
        VAMax_SF: 1,
        VArAct: null,
        VArMaxQ1: 500,
        VArMaxQ2: null,
        VArMaxQ3: null,
        VArMaxQ4: -500,
        VArMax_SF: 1,
        VMax: null,
        VMin: null,
        VMinMax_SF: null,
        VRef: 230,
        VRefOfs: 0,
        VRefOfs_SF: 0,
        VRef_SF: 0,
        WGra: null,
        WGra_SF: null,
        WMax: 500,
        WMax_SF: 1,
    };

    const result = getSettingsMetrics(settings);

    expect(result).toStrictEqual({
        ECPNomHz: null,
        MaxRmpRte: null,
        PFMinQ1: -0.8,
        PFMinQ2: null,
        PFMinQ3: null,
        PFMinQ4: 0.8,
        VAMax: 5000,
        VArMaxQ1: 5000,
        VArMaxQ2: null,
        VArMaxQ3: null,
        VArMaxQ4: -5000,
        VMax: null,
        VMin: null,
        VRef: 230,
        VRefOfs: 0,
        WGra: null,
        WMax: 5000,
    } satisfies ReturnType<typeof getSettingsMetrics>);
});
