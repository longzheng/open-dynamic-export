import type { CommonBlock } from './commonBlock';

export type SunSpecBrand = 'fronius' | 'sma' | 'solaredge';

export function getBrandByCommonBlock(commonBlock: CommonBlock): SunSpecBrand {
    switch (commonBlock.C_Manufacturer) {
        case 'Fronius':
            return 'fronius';
        case 'SMA':
            return 'sma';
        case 'SolarEdge':
            return 'solaredge';
        default:
            throw new Error(`Unknown brand: ${commonBlock.C_Manufacturer}`);
    }
}
