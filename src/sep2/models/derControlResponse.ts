import * as v from 'valibot';
import { coerceDateSchema } from '../../helpers/valibot.js';
import { dateToStringSeconds } from '../helpers/date.js';
import { xmlns } from '../helpers/namespace.js';
import { responseStatusSchema } from './responseStatus.js';

export const derControlResponseSchema = v.object({
    createdDateTime: coerceDateSchema,
    endDeviceLFDI: v.string(),
    status: responseStatusSchema,
    subject: v.pipe(
        v.string(),
        v.description('The mRID of the DERControl that is being responded to'),
    ),
});

export type DerControlResponse = v.InferOutput<typeof derControlResponseSchema>;

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
