import { z } from 'zod';

// Service kind
// 0 - electricity
// 1 - gas
// 2 - water
// 3 - time
// 4 - pressure
// 5 - heat
// 6 - cooling
// All other values reserved.
export enum ServiceKind {
    Electricity = '0',
    Gas = '1',
    Water = '2',
    Time = '3',
    Pressure = '4',
    Heat = '5',
    Cooling = '6',
}

export const serviceKindSchema = z.nativeEnum(ServiceKind);
