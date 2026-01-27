import * as v from 'valibot';

export const apparentPowerSchema = v.pipe(
    v.object({
        value: v.pipe(
            v.number(),
            v.description('Value in volt-amperes (uom 61)'),
        ),
        multiplier: v.pipe(
            v.number(),
            v.description('Specifies exponent of uom. power of ten multiplier'),
        ),
    }),
    v.description(
        'The apparent power S (in VA) is the product of root mean square (RMS) voltage and RMS current.',
    ),
);

export type ApparentPower = v.InferOutput<typeof apparentPowerSchema>;
