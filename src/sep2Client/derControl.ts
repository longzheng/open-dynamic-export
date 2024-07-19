import { safeParseStringToEnumType } from '../enum';
import { safeParseIntString } from '../number';
import { assertString } from './assert';
import { stringToBoolean } from './boolean';
import { stringIntToDate } from './date';
import {
    parseDERControlBaseXmlObject,
    type DERControlBase,
} from './derControlBase';
import {
    parseRespondableResourceXmlObject,
    type RespondableResource,
} from './respondableResource';

// Field representing the current status type.
// 0 = Scheduled This status indicates that the event has been scheduled and the event has not yet started. The server SHALL set the event to this status when the event is first scheduled and persist until the event has become active or has been cancelled. For events with a start time less than or equal to the current time, this status SHALL never be indicated, the event SHALL start with a status of “Active”.
// 1 = Active This status indicates that the event is currently active. The server SHALL set the event to this status when the event reaches its earliest Effective Start Time.
// 2 = Cancelled When events are cancelled, the Status.dateTime attribute SHALL be set to the time the cancellation occurred, which cannot be in the future. The server is responsible for maintaining the cancelled event in its collection for the duration of the original event, or until the server has run out of space and needs to store a new event. Client devices SHALL be aware of Cancelled events, determine if the Cancelled event applies to them, and cancel the event immediately if applicable.
// 3 = Cancelled with Randomization The server is responsible for maintaining the cancelled event in its collection for the duration of the Effective Scheduled Period. Client devices SHALL be aware of Cancelled with Randomization events, determine if the Cancelled event applies to them, and cancel the event immediately, using the larger of (absolute value of randomizeStart) and (absolute value of randomizeDuration) as the end randomization, in seconds. This Status.type SHALL NOT be used with "regular" Events, only with specializations of RandomizableEvent.
// 4 = Superseded Events marked as Superseded by servers are events that may have been replaced by new events from the same program that target the exact same set of deviceCategory's (if applicable) AND DERControl controls (e.g., opModTargetW) (if applicable) and overlap for a given period of time. Servers SHALL mark an event as Superseded at the earliest Effective Start Time of the overlapping event. Servers are responsible for maintaining the Superseded event in their collection for the duration of the Effective Scheduled Period. Client devices encountering a Superseded event SHALL terminate execution of the event immediately and commence execution of the new event immediately, unless the current time is within the start randomization window of the superseded event, in which case the client SHALL obey the start randomization of the new event.
// This Status.type SHALL NOT be used with TextMessage, since multiple text messages can be active.
// All other values reserved.
export enum DERControlEventStatusCurrentStatus {
    Scheduled = '0',
    Active = '1',
    Cancelled = '2',
    CancelledWithRandomization = '3',
    Superseded = '4',
}

type DERControlEventStatus = {
    currentStatus: DERControlEventStatusCurrentStatus;
    dateTime: Date;
    potentiallySuperseded: boolean;
    potentiallySupersededTime: Date;
    reason: string;
};

type DERControlEventInterval = {
    end: Date;
    durationSeconds: number;
    start: Date;
};

export type DERControl = {
    respondableResource: RespondableResource;
    mRID: string;
    version: number;
    creationTime: Date;
    eventStatus: DERControlEventStatus;
    interval: DERControlEventInterval;
    derControlBase: DERControlBase;
};

export function parseDERControlXmlObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): DERControl {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
    const respondableResource = parseRespondableResourceXmlObject(xmlObject);
    const mRID = assertString(xmlObject['mRID'][0]);
    const version = safeParseIntString(assertString(xmlObject['version'][0]));
    const creationTime = stringIntToDate(
        assertString(xmlObject['creationTime'][0]),
    );
    const eventStatus = parseEventStatusXmlObject(xmlObject['EventStatus'][0]);
    const interval = parseIntervalXmlObject(xmlObject['interval'][0]);
    const derControlBase = parseDERControlBaseXmlObject(
        xmlObject['DERControlBase'][0],
    );
    /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

    return {
        respondableResource,
        mRID,
        version,
        creationTime,
        eventStatus,
        interval,
        derControlBase,
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseEventStatusXmlObject(xmlObject: any): DERControlEventStatus {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const currentStatus = safeParseStringToEnumType(
        assertString(xmlObject['currentStatus'][0]),
        DERControlEventStatusCurrentStatus,
    );
    const dateTime = stringIntToDate(assertString(xmlObject['dateTime'][0]));
    const potentiallySuperseded = stringToBoolean(
        assertString(xmlObject['potentiallySuperseded'][0]),
    );
    const potentiallySupersededTime = stringIntToDate(
        assertString(xmlObject['potentiallySupersededTime'][0]),
    );
    const reason = assertString(xmlObject['reason'][0]);
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        currentStatus,
        dateTime,
        potentiallySuperseded,
        potentiallySupersededTime,
        reason,
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseIntervalXmlObject(xmlObject: any): DERControlEventInterval {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const start = stringIntToDate(assertString(xmlObject['start'][0]));
    const durationSeconds = safeParseIntString(
        assertString(xmlObject['duration'][0]),
    );
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    const end = new Date(start.getTime() + durationSeconds * 1000);

    return {
        start,
        durationSeconds,
        end,
    };
}
