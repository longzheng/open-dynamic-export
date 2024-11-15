import { describe, it, expect, vi, afterEach } from 'vitest';
import { withRetry } from './withRetry.js';
import { pinoLogger } from './logger.js';

vi.mock('./logger', () => ({
    pinoLogger: {
        error: vi.fn(),
    },
}));

describe('withRetry', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should return result on first attempt', async () => {
        const fn = vi.fn<() => unknown>().mockResolvedValue('success');

        const result = await withRetry(fn, {
            attempts: 3,
            functionName: 'testFn',
        });

        expect(result).toBe('success');
        expect(fn).toHaveBeenCalledTimes(1);
        expect(pinoLogger.error).toHaveBeenCalledTimes(0);
    });

    it('should retry and succeed on second attempt', async () => {
        const fn = vi
            .fn<() => unknown>()
            .mockRejectedValueOnce(new Error('fail'))
            .mockResolvedValueOnce('success');

        const result = await withRetry(fn, {
            attempts: 3,
            functionName: 'testFn',
        });

        expect(result).toBe('success');
        expect(fn).toHaveBeenCalledTimes(2);
        expect(pinoLogger.error).toHaveBeenCalledTimes(1);
    });

    it('should retry and fail after max attempts', async () => {
        const fn = vi.fn<() => unknown>().mockRejectedValue(new Error('fail'));

        await expect(
            withRetry(fn, { attempts: 3, functionName: 'testFn' }),
        ).rejects.toThrow('fail');

        expect(fn).toHaveBeenCalledTimes(3);
        expect(pinoLogger.error).toHaveBeenCalledTimes(3);
    });

    it('should wait for delay between retries', async () => {
        const fn = vi
            .fn<() => unknown>()
            .mockRejectedValueOnce(new Error('fail'))
            .mockResolvedValueOnce('success');

        const delayMilliseconds = 100;
        const start = Date.now();

        const result = await withRetry(fn, {
            attempts: 3,
            functionName: 'testFn',
            delayMilliseconds,
        });

        const end = Date.now();

        expect(result).toBe('success');
        expect(fn).toHaveBeenCalledTimes(2);
        expect(end - start).toBeGreaterThanOrEqual(delayMilliseconds);
        expect(pinoLogger.error).toHaveBeenCalledTimes(1);
    });
});
