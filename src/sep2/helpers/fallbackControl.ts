import { z } from 'zod';
import { defaultDERControlSchema } from '../models/defaultDerControl.js';

export const fallbackControlSchema = z.union([
    z.object({
        type: z.literal('default'),
        data: z.object({
            defaultControl: defaultDERControlSchema,
        }),
    }),
    z.object({
        type: z.literal('none'),
    }),
]);

export type FallbackControl = z.infer<typeof fallbackControlSchema>;
