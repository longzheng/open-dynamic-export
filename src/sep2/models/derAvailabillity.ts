import { dateToStringSeconds } from '../helpers/date.js';
import { xmlns } from '../helpers/namespace.js';
import { z } from 'zod';

export const derAvailabilitySchema = z.object({
    readingTime: z.coerce.date(),
});

export type DERAvailability = z.infer<typeof derAvailabilitySchema>;

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
