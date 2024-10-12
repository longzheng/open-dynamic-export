import { dateToStringSeconds } from '../helpers/date.js';
import { xmlns } from '../helpers/namespace.js';
import { responseStatusSchema } from './responseStatus.js';
import { z } from 'zod';

export const derControlResponseSchema = z.object({
    createdDateTime: z.coerce.date(),
    endDeviceLFDI: z.string(),
    status: responseStatusSchema,
    subject: z
        .string()
        .describe('The mRID of the DERControl that is being responded to'),
});

export type DerControlResponse = z.infer<typeof derControlResponseSchema>;

export function generateDerControlResponse({
    createdDateTime,
    endDeviceLFDI,
    status,
    subject,
}: DerControlResponse) {
    return {
        DERControlResponse: {
            $: { xmlns: xmlns._ },
            createdDateTime: dateToStringSeconds(createdDateTime),
            endDeviceLFDI,
            status: status.toString(),
            subject,
        },
    };
}
