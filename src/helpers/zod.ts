import { z } from 'zod';

// helper function to create a bitwise flag schema for any enum
export function zodBitwiseEnumSchema<
    EnumObj extends Record<string, string | number>,
>(enumObj: EnumObj) {
    const enumValues = Object.values(enumObj).filter(
        (v) => typeof v === 'number',
    );

    const allValidBits = enumValues.reduce((acc, val) => acc | val, 0);

    return z
        .number()
        .int()
        .refine(
            (val): val is EnumObj[keyof EnumObj] & number =>
                (val & ~allValidBits) === 0,
            { message: 'Invalid flags value' },
        );
}
