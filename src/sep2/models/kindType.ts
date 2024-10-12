import { z } from 'zod';

// 0 = Not Applicable (default, if not specified)
// 3 = Currency
// 8 = Demand
// 12 = Energy
// 37 = Power
// All other values reserved.
export enum KindType {
    NotApplicable = '0',
    Currency = '3',
    Demand = '8',
    Energy = '12',
    Power = '37',
}

export const kindTypeSchema = z.nativeEnum(KindType);
