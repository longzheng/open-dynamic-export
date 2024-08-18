import { safeParseIntString } from '../../helpers/number';
import { assertString } from '../helpers/assert';
import { stringIntToDate } from '../helpers/date';
import { parseEventStatusXmlObject, type EventStatus } from './eventStatus';
import {
    parseIdentifiedObjectXmlObject,
    type IdentifiedObject,
} from './identifiedObject';
import {
    parseRespondableResourceXmlObject,
    type RespondableResource,
} from './respondableResource';
import {
    parseSubscribableResourceXmlObject,
    type SubscribableResource,
} from './subscribableResource';

type Interval = {
    // duration in seconds
    duration: number;
    start: Date;
};

export type Event = {
    creationTime: Date;
    interval: Interval;
    eventStatus: EventStatus;
} & RespondableResource &
    SubscribableResource &
    IdentifiedObject;

export function parseEventXmlObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): Event {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
    const respondableResource = parseRespondableResourceXmlObject(xmlObject);
    const subscribableResource = parseSubscribableResourceXmlObject(xmlObject);
    const identifiedObject = parseIdentifiedObjectXmlObject(xmlObject);
    const creationTime = stringIntToDate(
        assertString(xmlObject['creationTime'][0]),
    );
    const interval = parseIntervalXmlObject(xmlObject['interval'][0]);
    const eventStatus = parseEventStatusXmlObject(xmlObject['EventStatus'][0]);
    /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

    return {
        ...respondableResource,
        ...subscribableResource,
        ...identifiedObject,
        creationTime,
        interval,
        eventStatus,
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseIntervalXmlObject(xmlObject: any): Interval {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const start = stringIntToDate(assertString(xmlObject['start'][0]));
    const durationSeconds = safeParseIntString(
        assertString(xmlObject['duration'][0]),
    );
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        start,
        duration: durationSeconds,
    };
}
