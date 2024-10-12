import { z } from 'zod';
// 0 = Not Applicable (default, if not specified)
// 1 = Electricity secondary metered value (a premises meter is typically on the low voltage, or secondary, side of a service transformer)
// 2 = Electricity primary metered value (measured on the high voltage, or primary, side of the service transformer)
// 4 = Air
// 7 = NaturalGas
// 8 = Propane
// 9 = PotableWater
// 10 = Steam
// 11 = WasteWater
// 12 = HeatingFluid
// 13 = CoolingFluid

// All other values reserved.
export enum CommodityType {
    NotApplicable = '0',
    ElectricitySecondaryMeteredValue = '1',
    ElectricityPrimaryMeteredValue = '2',
    Air = '4',
    NaturalGas = '7',
    Propane = '8',
    PotableWater = '9',
    Steam = '10',
    WasteWater = '11',
    HeatingFluid = '12',
    CoolingFluid = '13',
}

export const commodityTypeSchema = z.nativeEnum(CommodityType);
