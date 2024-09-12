import { safeParseIntString } from '../../helpers/number.js';
import { assertString } from '../helpers/assert.js';

// in seconds
export type PostRate = number | null;

export function parsePostRateXmlObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): PostRate {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const postRate = xmlObject['$']['postRate']
        ? safeParseIntString(assertString(xmlObject['$']['postRate']))
        : null;
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return postRate;
}
