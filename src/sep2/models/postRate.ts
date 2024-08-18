import { safeParseIntString } from '../../helpers/number';
import { assertString } from '../helpers/assert';

// in seconds
export type PostRate = number | null;

export function parsePostRateXmlObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): PostRate {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
    const postRate = xmlObject['$']['postRate']
        ? safeParseIntString(assertString(xmlObject['$']['postRate']))
        : null;
    /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

    return postRate;
}
