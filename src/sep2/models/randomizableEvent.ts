import { safeParseIntString } from '../../helpers/number.js';
import { assertString } from '../helpers/assert.js';
import { eventSchema, parseEventXmlObject } from './event.js';
import { z } from 'zod';

export const randomizableEventSchema = z
    .object({
        randomizeStart: z
            .number()
            .optional()
            .describe(
                'Number of seconds boundary inside which a random value must be selected to be applied to the associated interval start time, to avoid sudden synchronized demand changes. If related to price level changes, sign may be ignored. Valid range is -3600 to 3600. If not specified, 0 is the default.',
            ),
        randomizeDuration: z
            .number()
            .optional()
            .describe(
                'Number of seconds boundary inside which a random value must be selected to be applied to the associated interval duration, to avoid sudden synchronized demand changes. If related to price level changes, sign may be ignored. Valid range is -3600 to 3600. If not specified, 0 is the default.',
            ),
    })
    .merge(eventSchema);

export type RandomizableEvent = z.infer<typeof randomizableEventSchema>;

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
