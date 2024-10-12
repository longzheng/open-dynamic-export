import { safeParseIntString } from '../../helpers/number.js';
import { assertString } from '../helpers/assert.js';
import { stringIntToDate } from '../helpers/date.js';
import { z } from 'zod';

export const dateTimeIntervalSchema = z.object({
    duration: z.number().describe('Duration of the interval, in seconds.'),
    start: z.coerce
        .date()
        .describe('Date and time of the start of the interval.'),
});

export type DateTimeInterval = z.infer<typeof dateTimeIntervalSchema>;

export function parseDateTimeIntervalXmlObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): DateTimeInterval {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const start = stringIntToDate(assertString(xmlObject['start'][0]));
    const duration = safeParseIntString(assertString(xmlObject['duration'][0]));
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        start,
        duration,
    };
}
