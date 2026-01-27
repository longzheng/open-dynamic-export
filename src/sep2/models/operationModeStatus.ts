import * as v from 'valibot';
import { coerceDateSchema } from '../../helpers/valibot.js';

// DER OperationalModeStatus value:
// 0 - Not applicable / Unknown
// 1 - Off
// 2 - Operational mode
// 3 - Test mode
// All other values reserved.
export enum OperationalModeStatusValue {
    NotApplicable = 0,
    Off = 1,
    OperationalMode = 2,
    TestMode = 3,
}

const operationalModeStatusValueSchema = v.enum(OperationalModeStatusValue);

export const operationalModeStatusSchema = v.object({
    dateTime: coerceDateSchema,
    value: operationalModeStatusValueSchema,
});
