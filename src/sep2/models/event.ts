import * as v from 'valibot';
import { coerceDateSchema } from '../../helpers/valibot.js';
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

export const eventSchema = v.intersect([
    v.object({
        creationTime: coerceDateSchema,
        interval: dateTimeIntervalSchema,
        eventStatus: eventStatusSchema,
    }),
    respondableResourceSchema,
    subscribableResourceSchema,
    identifiedObjectSchema,
]);

export type Event = v.InferOutput<typeof eventSchema>;

export function parseEventXmlObject(
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): Event {
    /* oxlint-disable @typescript-eslint/no-unsafe-member-access */
    const respondableResource = parseRespondableResourceXmlObject(xmlObject);
    const subscribableResource = parseSubscribableResourceXmlObject(xmlObject);
    const identifiedObject = parseIdentifiedObjectXmlObject(xmlObject);
    const creationTime = stringIntToDate(
        assertString(xmlObject['creationTime'][0]),
    );
    const interval = parseDateTimeIntervalXmlObject(xmlObject['interval'][0]);
    const eventStatus = parseEventStatusXmlObject(xmlObject['EventStatus'][0]);
    /* oxlint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        ...respondableResource,
        ...subscribableResource,
        ...identifiedObject,
        creationTime,
        interval,
        eventStatus,
    };
}
