import type { CommonModel } from './models/common';

export type SunSpecBrand = 'fronius' | 'sma' | 'solaredge';

export function getBrandByCommonModel(commonModel: CommonModel): SunSpecBrand {
    switch (commonModel.Mn) {
        case 'Fronius':
            return 'fronius';
        case 'SMA':
            return 'sma';
        case 'SolarEdge':
            return 'solaredge';
        default:
            throw new Error(`Unknown brand: ${commonModel.Mn}`);
    }
}
