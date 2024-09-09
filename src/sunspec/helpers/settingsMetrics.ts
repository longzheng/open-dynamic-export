import {
    numberNullableWithPow10,
    numberWithPow10,
    sumNumbersArray,
    sumNumbersNullableArray,
} from '../../helpers/number.js';
import type { SettingsModel } from '../models/settings.js';

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

export function getAggregatedSettingsMetrics(
    settings: SettingsModel[],
): ReturnType<typeof getSettingsMetrics> {
    const metrics = settings.map(getSettingsMetrics);

    return {
        WMax: sumNumbersArray(metrics.map((metric) => metric.WMax)),
        VRef: sumNumbersArray(metrics.map((metric) => metric.VRef)),
        VRefOfs: sumNumbersArray(metrics.map((metric) => metric.VRefOfs)),
        VMax: sumNumbersNullableArray(metrics.map((metric) => metric.VMax)),
        VMin: sumNumbersNullableArray(metrics.map((metric) => metric.VMin)),
        VAMax: sumNumbersNullableArray(metrics.map((metric) => metric.VAMax)),
        VArMaxQ1: sumNumbersNullableArray(
            metrics.map((metric) => metric.VArMaxQ1),
        ),
        VArMaxQ2: sumNumbersNullableArray(
            metrics.map((metric) => metric.VArMaxQ2),
        ),
        VArMaxQ3: sumNumbersNullableArray(
            metrics.map((metric) => metric.VArMaxQ3),
        ),
        VArMaxQ4: sumNumbersNullableArray(
            metrics.map((metric) => metric.VArMaxQ4),
        ),
        WGra: sumNumbersNullableArray(metrics.map((metric) => metric.WGra)),
        PFMinQ1: sumNumbersNullableArray(
            metrics.map((metric) => metric.PFMinQ1),
        ),
        PFMinQ2: sumNumbersNullableArray(
            metrics.map((metric) => metric.PFMinQ2),
        ),
        PFMinQ3: sumNumbersNullableArray(
            metrics.map((metric) => metric.PFMinQ3),
        ),
        PFMinQ4: sumNumbersNullableArray(
            metrics.map((metric) => metric.PFMinQ4),
        ),
        MaxRmpRte: sumNumbersNullableArray(
            metrics.map((metric) => metric.MaxRmpRte),
        ),
        ECPNomHz: sumNumbersNullableArray(
            metrics.map((metric) => metric.ECPNomHz),
        ),
    };
}
