import { dateToStringSeconds } from '../helpers/date.js';
import { xmlns } from '../helpers/namespace.js';

export type DERAvailability = {
    readingTime: Date;
    // TODO: partially implemented
};

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
