import * as v from 'valibot';

export const reactivePowerSchema = v.pipe(
    v.object({
        value: v.pipe(
            v.number(),
            v.description('Value in volt-amperes reactive (var) (uom 63)'),
        ),
        multiplier: v.pipe(
            v.number(),
            v.description(
                'Specifies exponent of uom. power of ten multiplier',
            ),
        ),
    }),
    v.description(
        'The reactive power Q (in var) is the product of root mean square (RMS) voltage, RMS current, and sin(theta) where theta is the phase angle of current relative to voltage.',
    ),
);

export type ReactivePower = v.InferOutput<typeof reactivePowerSchema>;
