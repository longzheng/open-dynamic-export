import { readFile, writeFile } from 'fs/promises';
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

    async function get(): Promise<T | null> {
        const cachedFile = await (async () => {
            try {
                return await readFile(cachePath, 'utf8');
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

    async function set(data: T): Promise<void> {
        await writeFile(cachePath, JSON.stringify(data));
    }

    return { get, set };
}
