import { assertString } from '../helpers/assert.js';
import { stringIntToDate } from '../helpers/date.js';
import {
    parseDateTimeIntervalXmlObject,
    type DateTimeInterval,
} from './dateTimeInterval.js';
import { parseEventStatusXmlObject, type EventStatus } from './eventStatus.js';
import {
    parseIdentifiedObjectXmlObject,
    type IdentifiedObject,
} from './identifiedObject.js';
import {
    parseRespondableResourceXmlObject,
    type RespondableResource,
} from './respondableResource.js';
import {
    parseSubscribableResourceXmlObject,
    type SubscribableResource,
} from './subscribableResource.js';

export type Event = {
    creationTime: Date;
    interval: DateTimeInterval;
    eventStatus: EventStatus;
} & RespondableResource &
    SubscribableResource &
    IdentifiedObject;

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
