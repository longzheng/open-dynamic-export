import { dateToStringSeconds } from '../helpers/date';
import { xmlns } from '../helpers/namespace';

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
