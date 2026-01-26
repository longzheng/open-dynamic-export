import * as v from 'valibot';
import { coerceDateSchema } from '../../helpers/valibot.js';

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

const storageModeStatusValueSchema = v.enum(StorageModeStatusValue);

export const storageModeStatusSchema = v.object({
    dateTime: coerceDateSchema,
    value: storageModeStatusValueSchema,
});
