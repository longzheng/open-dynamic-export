import * as v from 'valibot';
import { coerceDateSchema } from '../../helpers/valibot.js';
import { safeParseIntString } from '../../helpers/number.js';
import { assertString } from '../helpers/assert.js';
import { stringIntToDate } from '../helpers/date.js';
import { parsePollRateXmlObject, pollRateSchema } from './pollRate.js';
import { parseResourceXmlObject, resourceSchema } from './resource.js';
import { timeQualitySchema } from './timeQuality.js';

export const timeSchema = v.intersect([
    v.object({
        pollRate: pollRateSchema,
        currentTime: coerceDateSchema,
        dstEndTime: coerceDateSchema,
        dstOffset: v.number(),
        dstStartTime: coerceDateSchema,
        localTime: v.optional(coerceDateSchema),
        quality: timeQualitySchema,
        tzOffset: v.number(),
    }),
    resourceSchema,
]);

export type Time = v.InferOutput<typeof timeSchema>;

// oxlint-disable-next-line @typescript-eslint/no-explicit-any
export function parseTimeXml(xml: any): Time {
    /* oxlint-disable @typescript-eslint/no-unsafe-member-access */
    const resource = parseResourceXmlObject(xml['Time']);
    const pollRate = parsePollRateXmlObject(xml['Time']);
    const currentTime = stringIntToDate(
        assertString(xml['Time']['currentTime'][0]),
    );
    const dstEndTime = stringIntToDate(
        assertString(xml['Time']['dstEndTime'][0]),
    );
    const dstOffset = safeParseIntString(
        assertString(xml['Time']['dstOffset'][0]),
    );
    const dstStartTime = stringIntToDate(
        assertString(xml['Time']['dstStartTime'][0]),
    );
    const localTime = xml['Time']['localTime']
        ? stringIntToDate(assertString(xml['Time']['localTime'][0]))
        : undefined;
    const quality = v.parse(
        timeQualitySchema,
        assertString(xml['Time']['quality'][0]),
    );
    const tzOffset = safeParseIntString(
        assertString(xml['Time']['tzOffset'][0]),
    );
    /* oxlint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        ...resource,
        pollRate,
        currentTime,
        dstEndTime,
        dstOffset,
        dstStartTime,
        localTime,
        quality,
        tzOffset,
    };
}
