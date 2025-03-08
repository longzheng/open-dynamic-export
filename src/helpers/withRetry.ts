import { pinoLogger } from './logger.js';

export async function withRetry<T>(
    fn: () => T | Promise<T>,
    {
        attempts,
        functionName,
        delayMilliseconds,
        abortController,
    }: {
        attempts: number;
        functionName: string;
        delayMilliseconds?: number;
        abortController?: AbortController;
    },
): Promise<T> {
    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            const result = await fn();

            if (abortController?.signal.aborted) {
                throw new Error('Operation was aborted');
            }

            return result;
        } catch (error) {
            if (abortController?.signal.aborted) {
                throw new Error('Operation was aborted');
            }

            pinoLogger.debug(
                error,
                `${functionName} withRetry attempt ${attempt} of ${attempts} failed`,
            );

            if (attempt < attempts && delayMilliseconds) {
                // todo: refactor to use import { setTimeout } from 'node:timers/promises'; when vitest supports mocking it
                await new Promise((resolve) =>
                    setTimeout(resolve, delayMilliseconds),
                );
            } else if (attempt === attempts) {
                // If this was the last attempt, rethrow the error
                throw error;
            }
        }
    }

    // This is a safeguard for TypeScript, but it should never be reached
    throw new Error('withRetry failed unexpectedly');
}
