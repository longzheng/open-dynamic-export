import { assertString } from '../helpers/assert.js';
import { booleanToString, stringToBoolean } from '../helpers/boolean.js';
import { dateToStringSeconds, stringIntToDate } from '../helpers/date.js';
import { xmlns } from '../helpers/namespace.js';
import { parseLinkXmlObject, type Link } from './link.js';
import { parseListLinkXmlObject, type ListLink } from './listLink.js';
import {
    parseSubscribableResourceXmlObject,
    type SubscribableResource,
} from './subscribableResource.js';

export type EndDevice = {
    lFDI?: string;
    sFDI: string;
    changedTime: Date;
    enabled: boolean;
    derListLink: ListLink | undefined;
    logEventListLink: ListLink | undefined;
    registrationLink: Link | undefined;
    functionSetAssignmentsListLink: ListLink | undefined;
    subscriptionListLink: ListLink | undefined;
    connectionPointLink: Link | undefined;
} & SubscribableResource;

export type EndDeviceResponse = Pick<
    EndDevice,
    'lFDI' | 'sFDI' | 'changedTime' | 'enabled'
>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseEndDeviceXml(xml: any): EndDevice {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const object = xml['EndDevice'];
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

    return parseEndDeviceObject(object);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseEndDeviceObject(endDeviceObject: any): EndDevice {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const subscribeableResource =
        parseSubscribableResourceXmlObject(endDeviceObject);
    const lFDI = endDeviceObject['lFDI']
        ? assertString(endDeviceObject['lFDI'][0])
        : undefined;
    const logEventListLink = endDeviceObject['LogEventListLink']
        ? parseListLinkXmlObject(endDeviceObject['LogEventListLink'][0])
        : undefined;
    const sFDI = assertString(endDeviceObject['sFDI'][0]);
    const changedTime = stringIntToDate(
        assertString(endDeviceObject['changedTime'][0]),
    );
    const registrationLink = parseLinkXmlObject(
        endDeviceObject['RegistrationLink'][0],
    );
    const enabled = endDeviceObject['enabled']
        ? stringToBoolean(assertString(endDeviceObject['enabled'][0]))
        : true;
    const derListLink = endDeviceObject['DERListLink']
        ? parseListLinkXmlObject(endDeviceObject['DERListLink'][0])
        : undefined;

    const functionSetAssignmentsListLink = endDeviceObject[
        'FunctionSetAssignmentsListLink'
    ]
        ? parseListLinkXmlObject(
              endDeviceObject['FunctionSetAssignmentsListLink'][0],
          )
        : undefined;
    const subscriptionListLink = endDeviceObject['SubscriptionListLink']
        ? parseListLinkXmlObject(endDeviceObject['SubscriptionListLink'][0])
        : undefined;
    const connectionPointLink = endDeviceObject['csipaus:ConnectionPointLink']
        ? parseLinkXmlObject(endDeviceObject['csipaus:ConnectionPointLink'][0])
        : undefined;
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        ...subscribeableResource,
        lFDI,
        logEventListLink,
        sFDI,
        changedTime,
        registrationLink,
        enabled,
        derListLink,
        functionSetAssignmentsListLink,
        subscriptionListLink,
        connectionPointLink,
    };
}

export function generateEndDeviceResponse({
    lFDI,
    sFDI,
    changedTime,
    enabled,
}: EndDeviceResponse) {
    return {
        EndDevice: {
            $: { xmlns: xmlns._ },
            sFDI,
            lFDI,
            enabled: booleanToString(enabled),
            changedTime: dateToStringSeconds(changedTime),
        },
    };
}
