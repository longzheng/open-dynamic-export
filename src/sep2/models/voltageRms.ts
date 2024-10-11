import { z } from 'zod';

export const voltageRMSSchema = z
    .object({
        value: z.number().describe('Value in volts RMS (uom 29)'),
        multiplier: z
            .number()
            .describe('Specifies exponent of uom. power of ten multiplier'),
    })
    .describe('Average electric potential difference between two points.');

export type VoltageRMS = z.infer<typeof voltageRMSSchema>;
