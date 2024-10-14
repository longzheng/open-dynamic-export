import { z } from 'zod';

export const apparentPowerSchema = z
    .object({
        value: z.number().describe('Value in volt-amperes (uom 61)'),
        multiplier: z
            .number()
            .describe('Specifies exponent of uom. power of ten multiplier'),
    })
    .describe(
        'The apparent power S (in VA) is the product of root mean square (RMS) voltage and RMS current.',
    );

export type ApparentPower = z.infer<typeof apparentPowerSchema>;
