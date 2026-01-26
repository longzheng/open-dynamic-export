import * as v from 'valibot';
import { safeParseIntString } from '../../helpers/number.js';
import { assertString } from '../helpers/assert.js';
import { eventSchema, parseEventXmlObject } from './event.js';

export const randomizableEventSchema = v.intersect([
    v.object({
        randomizeStart: v.pipe(
            v.optional(v.number()),
            v.description(
                'Number of seconds boundary inside which a random value must be selected to be applied to the associated interval start time, to avoid sudden synchronized demand changes. If related to price level changes, sign may be ignored. Valid range is -3600 to 3600. If not specified, 0 is the default.',
            ),
        ),
        randomizeDuration: v.pipe(
            v.optional(v.number()),
            v.description(
                'Number of seconds boundary inside which a random value must be selected to be applied to the associated interval duration, to avoid sudden synchronized demand changes. If related to price level changes, sign may be ignored. Valid range is -3600 to 3600. If not specified, 0 is the default.',
            ),
        ),
    }),
    eventSchema,
]);

export type RandomizableEvent = v.InferOutput<typeof randomizableEventSchema>;

export function parseRandomizableEventXmlObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): RandomizableEvent {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const event = parseEventXmlObject(xmlObject);
    const randomizeStart = xmlObject['randomizeStart']
        ? safeParseIntString(assertString(xmlObject['randomizeStart'][0]))
        : undefined;
    const randomizeDuration = xmlObject['randomizeDuration']
        ? safeParseIntString(assertString(xmlObject['randomizeDuration'][0]))
        : undefined;
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        ...event,
        randomizeStart,
        randomizeDuration,
    };
}
