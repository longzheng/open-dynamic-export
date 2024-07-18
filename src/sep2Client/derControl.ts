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

export enum DERControlEventStatusCurrentStatus {
    Scheduled = 0,
    Active = 1,
    Cancelled = 2,
    CancelledWithRandomization = 3,
    Superseded = 4,
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
    const currentStatus = stringToDERControlEventStatusCurrentStatus(
        assertString(xmlObject['currentStatus'][0]),
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

function stringToDERControlEventStatusCurrentStatus(
    value: string,
): DERControlEventStatusCurrentStatus {
    switch (value) {
        case '0':
            return DERControlEventStatusCurrentStatus.Scheduled;
        case '1':
            return DERControlEventStatusCurrentStatus.Active;
        case '2':
            return DERControlEventStatusCurrentStatus.Cancelled;
        case '3':
            return DERControlEventStatusCurrentStatus.CancelledWithRandomization;
        case '4':
            return DERControlEventStatusCurrentStatus.Superseded;
        default:
            throw new Error(`Unexpected EventStatus currentStatus: ${value}`);
    }
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
