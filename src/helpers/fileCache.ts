import { writeFile } from 'fs/promises';
import { readFileSync } from 'fs';
import type { ZodSchema } from 'zod';
import { env } from './env.js';
import { logger } from './logger.js';

export function createFileCache<T>({
    filename,
    schema,
}: {
    filename: string;
    schema: ZodSchema<T>;
}) {
    const cachePath = `${env.CONFIG_DIR}/cache_${filename}.json`;

    function get(): T | null {
        const cachedFile = (() => {
            try {
                return readFileSync(cachePath, 'utf8');
            } catch {
                return null;
            }
        })();

        if (!cachedFile) {
            return null;
        }

        const result = schema.safeParse(JSON.parse(cachedFile));

        if (!result.success) {
            logger.warn({
                error: result.error,
                message: 'Failed to parse cache file',
            });
            return null;
        }

        return result.data;
    }

    function set(data: T): void {
        void writeFile(cachePath, JSON.stringify(data));
    }

    return { get, set };
}
