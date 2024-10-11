import { z } from 'zod';
import { env } from '../../helpers/env.js';
import { writeFile } from 'fs/promises';
import { readFileSync } from 'fs';
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

export function getCachedPath() {
    return `${env.CONFIG_DIR}/cache_fallbackControl.json`;
}

export function getCachedFallbackControl(): FallbackControl | null {
    const cachedFile = (() => {
        try {
            return readFileSync(getCachedPath(), 'utf8');
        } catch {
            return null;
        }
    })();

    if (!cachedFile) {
        return null;
    }

    const result = fallbackControlSchema.safeParse(JSON.parse(cachedFile));

    if (!result.success) {
        return null;
    }

    return result.data;
}

export function cacheFallbackControl(data: FallbackControl) {
    void writeFile(getCachedPath(), JSON.stringify(data));
}
