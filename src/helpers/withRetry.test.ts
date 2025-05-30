import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { withRetry } from './withRetry.js';
import { pinoLogger } from './logger.js';

vi.mock('./logger', () => ({
    pinoLogger: {
        debug: vi.fn(),
    },
}));

describe('withRetry', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.clearAllMocks();

        vi.useRealTimers();
    });

    it('should return result on first attempt', async () => {
        const fn = vi.fn<() => unknown>().mockResolvedValue('success');

        const result = await withRetry(fn, {
            attempts: 3,
            functionName: 'testFn',
        });

        expect(result).toBe('success');
        expect(fn).toHaveBeenCalledTimes(1);
        expect(pinoLogger.debug).toHaveBeenCalledTimes(0);
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
        expect(pinoLogger.debug).toHaveBeenCalledTimes(1);
    });

    it('should retry and fail after max attempts', async () => {
        const fn = vi.fn<() => unknown>().mockRejectedValue(new Error('fail'));

        await expect(
            withRetry(fn, { attempts: 3, functionName: 'testFn' }),
        ).rejects.toThrow('fail');

        expect(fn).toHaveBeenCalledTimes(3);
        expect(pinoLogger.debug).toHaveBeenCalledTimes(3);
    });

    it('should wait for delay between retries', async () => {
        const fn = vi
            .fn<() => unknown>()
            .mockRejectedValueOnce(new Error('fail'))
            .mockResolvedValueOnce('success');

        const delayMilliseconds = 100;

        let result;
        void withRetry(fn, {
            attempts: 3,
            functionName: 'testFn',
            delayMilliseconds,
        }).then((res) => (result = res));

        // before retry
        await vi.advanceTimersByTimeAsync(delayMilliseconds - 1);
        expect(result).toBeUndefined();
        expect(fn).toHaveBeenCalledTimes(1);

        // after retry
        await vi.advanceTimersByTimeAsync(delayMilliseconds);
        expect(result).toBe('success');
        expect(fn).toHaveBeenCalledTimes(2);
        expect(pinoLogger.debug).toHaveBeenCalledTimes(1);
    });

    it('should throw error when operation is aborted', async () => {
        const abortController = new AbortController();
        const mockFn = vi.fn().mockRejectedValue(new Error('Test error'));

        const retryPromise = withRetry(mockFn, {
            attempts: 3,
            functionName: 'mockFn',
            delayMilliseconds: 10,
            abortController,
        });

        abortController.abort();

        await expect(retryPromise).rejects.toThrow('Operation was aborted');
    });
});
