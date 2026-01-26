import * as v from 'valibot';
import { assertArray } from '../helpers/assert.js';
import { listSchema, parseListXmlObject } from './list.js';
import {
    mirrorUsagePointSchema,
    parseMirrorUsagePointXmlObject,
} from './mirrorUsagePoint.js';
import { parsePollRateXmlObject, pollRateSchema } from './pollRate.js';

export const mirrorUsagePointListSchema = v.intersect([
    v.object({
        pollRate: pollRateSchema,
        mirrorUsagePoints: v.array(mirrorUsagePointSchema),
    }),
    listSchema,
]);

export type MirrorUsagePointList = v.InferOutput<typeof mirrorUsagePointListSchema>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseMirrorUsagePointListXml(xml: any): MirrorUsagePointList {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const list = parseListXmlObject(xml['MirrorUsagePointList']);
    const pollRate = parsePollRateXmlObject(xml['MirrorUsagePointList']);
    const mirrorUsagePointArray = assertArray(
        xml['MirrorUsagePointList']['MirrorUsagePoint'],
    );
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    const mirrorUsagePoints = mirrorUsagePointArray.map((mirrorUsagePoint) =>
        parseMirrorUsagePointXmlObject(mirrorUsagePoint),
    );

    return {
        ...list,
        pollRate,
        mirrorUsagePoints,
    };
}
