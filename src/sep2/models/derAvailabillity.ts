import * as v from 'valibot';
import { coerceDateSchema } from '../../helpers/valibot.js';
import { dateToStringSeconds } from '../helpers/date.js';
import { xmlns } from '../helpers/namespace.js';

export const derAvailabilitySchema = v.object({
    readingTime: coerceDateSchema,
});

export type DERAvailability = v.InferOutput<typeof derAvailabilitySchema>;

export function generateDerAvailabilityResponse({
    readingTime,
}: DERAvailability) {
    return {
        DERAvailability: {
            $: { xmlns: xmlns._ },
            readingTime: dateToStringSeconds(readingTime),
        },
    };
}
