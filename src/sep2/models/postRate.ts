import * as v from 'valibot';
import { safeParseIntString } from '../../helpers/number.js';
import { assertString } from '../helpers/assert.js';

export const postRateSchema = v.pipe(
    v.nullable(v.number()),
    v.description('In seconds'),
);

export type PostRate = v.InferOutput<typeof postRateSchema>;

export function parsePostRateXmlObject(
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): PostRate {
    /* oxlint-disable @typescript-eslint/no-unsafe-member-access */
    const postRate = xmlObject['postRate']
        ? safeParseIntString(assertString(xmlObject['postRate'][0]))
        : null;
    /* oxlint-enable @typescript-eslint/no-unsafe-member-access */

    return postRate;
}
