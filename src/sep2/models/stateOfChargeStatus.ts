import { z } from 'zod';
import { perCentSchema } from './perCent.js';

export const stateOfChargeStatusSchema = z.object({
    dateTime: z.coerce.date(),
    value: perCentSchema,
});
