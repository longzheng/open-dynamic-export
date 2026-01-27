import * as v from 'valibot';
import { coerceDateSchema } from '../../helpers/valibot.js';
import { safeParseIntString } from '../../helpers/number.js';
import { assertString } from '../helpers/assert.js';
import { stringIntToDate } from '../helpers/date.js';

export const dateTimeIntervalSchema = v.object({
    duration: v.pipe(
        v.number(),
        v.description('Duration of the interval, in seconds.'),
    ),
    start: v.pipe(
        coerceDateSchema,
        v.description('Date and time of the start of the interval.'),
    ),
});

export type DateTimeInterval = v.InferOutput<typeof dateTimeIntervalSchema>;

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
