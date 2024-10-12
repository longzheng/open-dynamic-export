import { z } from 'zod';

export const reactivePowerSchema = z
    .object({
        value: z
            .number()
            .describe('Value in volt-amperes reactive (var) (uom 63)'),
        multiplier: z
            .number()
            .describe('Specifies exponent of uom. power of ten multiplier'),
    })
    .describe(
        'The reactive power Q (in var) is the product of root mean square (RMS) voltage, RMS current, and sin(theta) where theta is the phase angle of current relative to voltage.',
    );

export type ReactivePower = z.infer<typeof reactivePowerSchema>;
