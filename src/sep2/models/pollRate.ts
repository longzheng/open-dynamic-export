import { safeParseIntString } from '../../number';
import { assertString } from '../helpers/assert';

// in seconds
export type PollRate = number | null;

export function parsePollRateXmlObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): PollRate {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
    const pollRate = xmlObject['$']['pollRate']
        ? safeParseIntString(assertString(xmlObject['$']['pollRate']))
        : null;
    /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

    return pollRate;
}
