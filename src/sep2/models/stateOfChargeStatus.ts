import * as v from 'valibot';
import { coerceDateSchema } from '../../helpers/valibot.js';
import { perCentSchema } from './perCent.js';

export const stateOfChargeStatusSchema = v.object({
    dateTime: coerceDateSchema,
    value: perCentSchema,
});
