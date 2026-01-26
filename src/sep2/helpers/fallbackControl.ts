import * as v from 'valibot';
import { defaultDERControlSchema } from '../models/defaultDerControl.js';

export const fallbackControlSchema = v.union([
    v.object({
        type: v.literal('default'),
        data: v.object({
            defaultControl: defaultDERControlSchema,
        }),
    }),
    v.object({
        type: v.literal('none'),
    }),
]);

export type FallbackControl = v.InferOutput<typeof fallbackControlSchema>;
