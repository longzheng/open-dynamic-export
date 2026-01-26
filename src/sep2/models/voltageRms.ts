import * as v from 'valibot';

export const voltageRMSSchema = v.pipe(
    v.object({
        value: v.pipe(v.number(), v.description('Value in volts RMS (uom 29)')),
        multiplier: v.pipe(
            v.number(),
            v.description('Specifies exponent of uom. power of ten multiplier'),
        ),
    }),
    v.description('Average electric potential difference between two points.'),
);

export type VoltageRMS = v.InferOutput<typeof voltageRMSSchema>;
