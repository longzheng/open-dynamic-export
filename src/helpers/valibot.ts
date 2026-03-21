import * as v from 'valibot';

// Helper function to create a bitwise flag schema for any enum.
export function bitwiseEnumSchema<
    EnumObj extends Record<string, string | number>,
>(enumObj: EnumObj) {
    const enumValues = Object.values(enumObj).filter(
        (value): value is number => typeof value === 'number',
    );

    const allValidBits = enumValues.reduce((acc, val) => acc | val, 0);

    return v.pipe(
        v.number(),
        v.integer(),
        v.check(
            (val): val is EnumObj[keyof EnumObj] & number =>
                (val & ~allValidBits) === 0,
            'Invalid flags value',
        ),
    );
}

export const coerceDateSchema = v.pipe(
    v.union([v.string(), v.number(), v.date()]),
    v.toDate(),
);
