import { it, expect, describe } from 'vitest';
import { enumHasValue } from './enum.js';

enum TestBitwise {
    hello = 1 << 0,
    world = 1 << 1,
    there = 1 << 2,
}

describe('enumHasValue', () => {
    it('should return true if value is in enum', () => {
        const result = enumHasValue(
            TestBitwise.hello | TestBitwise.world,
            TestBitwise.hello,
        );

        expect(result).toBe(true);
    });

    it('should return false if value is not in enum', () => {
        const result = enumHasValue(TestBitwise.hello, TestBitwise.world);

        expect(result).toBe(false);
    });
});
