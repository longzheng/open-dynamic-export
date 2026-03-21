import * as v from 'valibot';
import { assertArray } from '../helpers/assert.js';
import { derSchema, parseDerXmlObject } from './der.js';
import { listSchema, parseListXmlObject } from './list.js';
import { parsePollRateXmlObject, pollRateSchema } from './pollRate.js';

export const derListSchema = v.intersect([
    v.object({
        pollRate: pollRateSchema,
        ders: v.pipe(
            v.array(derSchema),
            v.description('Link to the end device'),
        ),
    }),
    listSchema,
]);

export type DERList = v.InferOutput<typeof derListSchema>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseDerListXml(xml: any): DERList {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const list = parseListXmlObject(xml['DERList']);
    const pollRate = parsePollRateXmlObject(xml['DERList']);
    const derArray = assertArray(xml['DERList']['DER']);
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    const ders = derArray.map((derXmlObject) =>
        parseDerXmlObject(derXmlObject),
    );

    return {
        ...list,
        pollRate,
        ders,
    };
}
