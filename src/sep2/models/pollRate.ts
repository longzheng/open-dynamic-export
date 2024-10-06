import { safeParseIntString } from '../../helpers/number.js';
import { assertString } from '../helpers/assert.js';

// in seconds
export type PollRate = number | null;

export function parsePollRateXmlObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): PollRate {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const pollRate = xmlObject['$']['pollRate']
        ? safeParseIntString(assertString(xmlObject['$']['pollRate']))
        : null;
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return pollRate;
}
