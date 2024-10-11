import { z } from 'zod';
import { assertString } from '../helpers/assert.js';
import { stringIntToDate } from '../helpers/date.js';
import {
    dateTimeIntervalSchema,
    parseDateTimeIntervalXmlObject,
} from './dateTimeInterval.js';
import { eventStatusSchema, parseEventStatusXmlObject } from './eventStatus.js';
import {
    identifiedObjectSchema,
    parseIdentifiedObjectXmlObject,
} from './identifiedObject.js';
import {
    parseRespondableResourceXmlObject,
    respondableResourceSchema,
} from './respondableResource.js';
import {
    parseSubscribableResourceXmlObject,
    subscribableResourceSchema,
} from './subscribableResource.js';

export const eventSchema = z
    .object({
        creationTime: z.date(),
        interval: dateTimeIntervalSchema,
        eventStatus: eventStatusSchema,
    })
    .merge(respondableResourceSchema)
    .merge(subscribableResourceSchema)
    .merge(identifiedObjectSchema);

export type Event = z.infer<typeof eventSchema>;

export function parseEventXmlObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): Event {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const respondableResource = parseRespondableResourceXmlObject(xmlObject);
    const subscribableResource = parseSubscribableResourceXmlObject(xmlObject);
    const identifiedObject = parseIdentifiedObjectXmlObject(xmlObject);
    const creationTime = stringIntToDate(
        assertString(xmlObject['creationTime'][0]),
    );
    const interval = parseDateTimeIntervalXmlObject(xmlObject['interval'][0]);
    const eventStatus = parseEventStatusXmlObject(xmlObject['EventStatus'][0]);
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        ...respondableResource,
        ...subscribableResource,
        ...identifiedObject,
        creationTime,
        interval,
        eventStatus,
    };
}
