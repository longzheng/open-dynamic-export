import { describe, it, expect } from 'vitest';
import { tryCatchResult } from './result.js';

describe('tryCatchResult', () => {
    it('should return success true with value when function resolves', async () => {
        const mockFn = () => 'test value';

        const result = await tryCatchResult(mockFn);

        expect(result).toEqual({
            success: true,
            value: 'test value',
        });
    });

    it('should return success false with error when function throws', async () => {
        const mockFn = () => {
            throw new Error('test error');
        };

        const result = await tryCatchResult(mockFn);

        expect(result).toEqual({
            success: false,
            error: new Error('test error'),
        });
    });
});
