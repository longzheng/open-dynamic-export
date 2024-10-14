import { describe, it, expect } from 'vitest';
import { zodBitwiseEnumSchema } from './zod.js';

enum TestEnum {
    BIT_ZERO = 1 << 0,
    BIT_ONE = 1 << 1,
    BIT_TWO = 1 << 2,
}

describe('zodBitwiseEnumSchema', () => {
    const schema = zodBitwiseEnumSchema(TestEnum);

    it('should validate a single valid flag', () => {
        expect(schema.safeParse(TestEnum.BIT_ZERO).success).toBe(true);
        expect(schema.safeParse(TestEnum.BIT_ONE).success).toBe(true);
        expect(schema.safeParse(TestEnum.BIT_TWO).success).toBe(true);
    });

    it('should validate a combination of valid flags', () => {
        expect(
            schema.safeParse(TestEnum.BIT_ZERO | TestEnum.BIT_ONE).data,
        ).toBe(TestEnum.BIT_ZERO | TestEnum.BIT_ONE);

        expect(
            schema.safeParse(TestEnum.BIT_ZERO | TestEnum.BIT_TWO).data,
        ).toBe(TestEnum.BIT_ZERO | TestEnum.BIT_TWO);

        expect(
            schema.safeParse(
                TestEnum.BIT_ZERO | TestEnum.BIT_ONE | TestEnum.BIT_TWO,
            ).data,
        ).toBe(TestEnum.BIT_ZERO | TestEnum.BIT_ONE | TestEnum.BIT_TWO);
    });

    it('should validate a valid value but not an enum type', () => {
        expect(schema.safeParse(3).data).toBe(
            TestEnum.BIT_ZERO | TestEnum.BIT_ONE,
        );
    });

    it('should invalidate an invalid flag', () => {
        expect(schema.safeParse(8).success).toBe(false);
    });

    it('should invalidate a combination of valid and invalid flags', () => {
        expect(schema.safeParse(TestEnum.BIT_ZERO | 8).success).toBe(false);
    });

    it('should invalidate non-integer values', () => {
        expect(schema.safeParse(1.5).success).toBe(false);
    });

    it('should invalidate non-number values', () => {
        expect(schema.safeParse('string').success).toBe(false);
        expect(schema.safeParse(null).success).toBe(false);
        expect(schema.safeParse(undefined).success).toBe(false);
    });
});
