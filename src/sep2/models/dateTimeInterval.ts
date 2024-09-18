import { safeParseIntString } from '../../helpers/number.js';
import { assertString } from '../helpers/assert.js';
import { stringIntToDate } from '../helpers/date.js';

export type DateTimeInterval = {
    /**
     * Duration of the interval, in seconds.
     */
    duration: number;
    /**
     * Date and time of the start of the interval.
     */
    start: Date;
};

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
