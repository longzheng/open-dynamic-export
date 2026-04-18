import * as v from 'valibot';
import { safeParseIntString } from '../../helpers/number.js';
import { assertString } from '../helpers/assert.js';

export const pollRateSchema = v.pipe(
    v.nullable(v.number()),
    v.description('In seconds'),
);

export type PollRate = v.InferOutput<typeof pollRateSchema>;

export function parsePollRateXmlObject(
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): PollRate {
    /* oxlint-disable @typescript-eslint/no-unsafe-member-access */
    const pollRate = xmlObject['$']['pollRate']
        ? safeParseIntString(assertString(xmlObject['$']['pollRate']))
        : null;
    /* oxlint-enable @typescript-eslint/no-unsafe-member-access */

    return pollRate;
}
