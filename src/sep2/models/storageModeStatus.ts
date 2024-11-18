import { z } from 'zod';

// DER StorageModeStatus value:
// 0 – storage charging
// 1 – storage discharging
// 2 – storage holding
// All other values reserved.
export enum StorageModeStatusValue {
    StorageCharging = 0,
    StorageDischarging = 1,
    StorageHolding = 2,
}

const storageModeStatusValueSchema = z.nativeEnum(StorageModeStatusValue);

export const storageModeStatusSchema = z.object({
    dateTime: z.coerce.date(),
    value: storageModeStatusValueSchema,
});
