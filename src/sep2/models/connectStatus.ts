import * as v from 'valibot';
import { bitwiseEnumSchema, coerceDateSchema } from '../../helpers/valibot.js';

// DER ConnectStatus value (bitmap):
// 0 - Connected
// 1 - Available
// 2 - Operating
// 3 - Test
// 4 - Fault / Error
// All other values reserved.
export enum ConnectStatusValue {
    Connected = 1 << 0,
    Available = 1 << 1,
    Operating = 1 << 2,
    Test = 1 << 3,
    Fault = 1 << 4,
}

export const connectStatusValueSchema = bitwiseEnumSchema(ConnectStatusValue);

export const connectStatusSchema = v.object({
    dateTime: coerceDateSchema,
    value: connectStatusValueSchema,
});
