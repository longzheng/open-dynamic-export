import {
    numberWithPow10,
    numberNullableWithPow10,
} from '../../../helpers/number.js';
import { type SettingsModel } from '../models/settings.js';

export function getSettingsMetrics(settings: SettingsModel) {
    return {
        WMax: numberWithPow10(settings.WMax, settings.WMax_SF),
        VRef: numberWithPow10(settings.VRef, settings.VRef_SF),
        VRefOfs: numberWithPow10(settings.VRefOfs, settings.VRefOfs_SF),
        VMax:
            settings.VMax && settings.VMinMax_SF
                ? numberWithPow10(settings.VMax, settings.VMinMax_SF)
                : null,
        VMin:
            settings.VMin && settings.VMinMax_SF
                ? numberWithPow10(settings.VMin, settings.VMinMax_SF)
                : null,
        VAMax:
            settings.VAMax && settings.VAMax_SF
                ? numberWithPow10(settings.VAMax, settings.VAMax_SF)
                : null,
        VArMaxQ1: settings.VArMax_SF
            ? numberWithPow10(settings.VArMaxQ1, settings.VArMax_SF)
            : null,
        VArMaxQ2:
            settings.VArMaxQ2 && settings.VArMax_SF
                ? numberNullableWithPow10(settings.VArMaxQ2, settings.VArMax_SF)
                : null,
        VArMaxQ3:
            settings.VArMaxQ3 && settings.VArMax_SF
                ? numberNullableWithPow10(settings.VArMaxQ3, settings.VArMax_SF)
                : null,
        VArMaxQ4: settings.VArMax_SF
            ? numberWithPow10(settings.VArMaxQ4, settings.VArMax_SF)
            : null,
        WGra:
            settings.WGra && settings.WGra_SF
                ? numberWithPow10(settings.WGra, settings.WGra_SF)
                : null,
        PFMinQ1: settings.PFMin_SF
            ? numberWithPow10(settings.PFMinQ1, settings.PFMin_SF)
            : null,
        PFMinQ2:
            settings.PFMinQ2 && settings.PFMin_SF
                ? numberNullableWithPow10(settings.PFMinQ2, settings.PFMin_SF)
                : null,
        PFMinQ3:
            settings.PFMinQ3 && settings.PFMin_SF
                ? numberNullableWithPow10(settings.PFMinQ3, settings.PFMin_SF)
                : null,
        PFMinQ4: settings.PFMin_SF
            ? numberWithPow10(settings.PFMinQ4, settings.PFMin_SF)
            : null,
        MaxRmpRte:
            settings.MaxRmpRte && settings.MaxRmpRte_SF
                ? numberWithPow10(settings.MaxRmpRte, settings.MaxRmpRte_SF)
                : null,
        ECPNomHz:
            settings.ECPNomHz && settings.ECPNomHz_SF
                ? numberWithPow10(settings.ECPNomHz, settings.ECPNomHz_SF)
                : null,
    };
}
