import { readFile, writeFile } from 'fs/promises';
import * as v from 'valibot';
import { env } from './env.js';
import { pinoLogger } from './logger.js';

export function createFileCache<T>({
    filename,
    schema,
}: {
    filename: string;
    schema: v.BaseSchema<unknown, T, v.BaseIssue<unknown>>;
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

        const result = v.safeParse(schema, JSON.parse(cachedFile));

        if (!result.success) {
            pinoLogger.warn({
                error: result.issues,
                message: 'Failed to parse cache file',
            });
            return null;
        }

        return result.output;
    }

    async function set(data: T): Promise<void> {
        await writeFile(cachePath, JSON.stringify(data));
    }

    return { get, set };
}
