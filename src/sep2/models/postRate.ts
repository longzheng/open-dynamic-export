import { safeParseIntString } from '../../helpers/number.js';
import { assertString } from '../helpers/assert.js';
import { z } from 'zod';

export const postRateSchema = z
    .union([z.number(), z.null()])
    .describe('In seconds');

export type PostRate = z.infer<typeof postRateSchema>;

export function parsePostRateXmlObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): PostRate {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const postRate = xmlObject['postRate']
        ? safeParseIntString(assertString(xmlObject['postRate'][0]))
        : null;
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return postRate;
}
