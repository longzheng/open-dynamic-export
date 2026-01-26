import { describe, it, expect } from 'vitest';
import * as v from 'valibot';
import { bitwiseEnumSchema } from './valibot.js';

enum TestEnum {
    BIT_ZERO = 1 << 0,
    BIT_ONE = 1 << 1,
    BIT_TWO = 1 << 2,
}

describe('bitwiseEnumSchema', () => {
    const schema = bitwiseEnumSchema(TestEnum);

    it('should validate a single valid flag', () => {
        expect(v.safeParse(schema, TestEnum.BIT_ZERO).success).toBe(true);
        expect(v.safeParse(schema, TestEnum.BIT_ONE).success).toBe(true);
        expect(v.safeParse(schema, TestEnum.BIT_TWO).success).toBe(true);
    });

    it('should validate a combination of valid flags', () => {
        expect(
            v.safeParse(schema, TestEnum.BIT_ZERO | TestEnum.BIT_ONE).output,
        ).toBe(TestEnum.BIT_ZERO | TestEnum.BIT_ONE);

        expect(
            v.safeParse(schema, TestEnum.BIT_ZERO | TestEnum.BIT_TWO).output,
        ).toBe(TestEnum.BIT_ZERO | TestEnum.BIT_TWO);

        expect(
            v.safeParse(
                schema,
                TestEnum.BIT_ZERO | TestEnum.BIT_ONE | TestEnum.BIT_TWO,
            ).output,
        ).toBe(TestEnum.BIT_ZERO | TestEnum.BIT_ONE | TestEnum.BIT_TWO);
    });

    it('should validate a valid value but not an enum type', () => {
        expect(v.safeParse(schema, 3).output).toBe(
            TestEnum.BIT_ZERO | TestEnum.BIT_ONE,
        );
    });

    it('should invalidate an invalid flag', () => {
        expect(v.safeParse(schema, 8).success).toBe(false);
    });

    it('should invalidate a combination of valid and invalid flags', () => {
        expect(v.safeParse(schema, TestEnum.BIT_ZERO | 8).success).toBe(false);
    });

    it('should invalidate non-integer values', () => {
        expect(v.safeParse(schema, 1.5).success).toBe(false);
    });

    it('should invalidate non-number values', () => {
        expect(v.safeParse(schema, 'string').success).toBe(false);
        expect(v.safeParse(schema, null).success).toBe(false);
        expect(v.safeParse(schema, undefined).success).toBe(false);
    });
});
