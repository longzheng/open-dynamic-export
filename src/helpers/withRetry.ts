import { pinoLogger } from './logger.js';

export async function withRetry<T>(
    fn: () => T | Promise<T>,
    {
        attempts,
        functionName,
        delayMilliseconds,
    }: {
        attempts: number;
        functionName: string;
        delayMilliseconds?: number;
    },
): Promise<T> {
    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            const result = await fn();

            return result;
        } catch (error) {
            pinoLogger.warn(
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
