import * as v from 'valibot';
import { coerceDateSchema } from '../../helpers/valibot.js';
import { assertString } from '../helpers/assert.js';
import { booleanToString, stringToBoolean } from '../helpers/boolean.js';
import { dateToStringSeconds, stringIntToDate } from '../helpers/date.js';
import { xmlns } from '../helpers/namespace.js';
import { linkSchema, parseLinkXmlObject } from './link.js';
import { listLinkSchema, parseListLinkXmlObject } from './listLink.js';
import {
    parseSubscribableResourceXmlObject,
    subscribableResourceSchema,
} from './subscribableResource.js';

export const endDeviceSchema = v.intersect([
    v.object({
        lFDI: v.optional(v.string()),
        sFDI: v.string(),
        changedTime: coerceDateSchema,
        enabled: v.boolean(),
        derListLink: v.optional(listLinkSchema),
        logEventListLink: v.optional(listLinkSchema),
        registrationLink: v.optional(linkSchema),
        functionSetAssignmentsListLink: v.optional(listLinkSchema),
        subscriptionListLink: v.optional(listLinkSchema),
        connectionPointLink: v.optional(linkSchema),
    }),
    subscribableResourceSchema,
]);

export type EndDevice = v.InferOutput<typeof endDeviceSchema>;

export type EndDeviceResponse = Pick<
    EndDevice,
    'lFDI' | 'sFDI' | 'changedTime' | 'enabled'
>;

// oxlint-disable-next-line @typescript-eslint/no-explicit-any
export function parseEndDeviceXml(xml: any): EndDevice {
    /* oxlint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const object = xml['EndDevice'];
    /* oxlint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

    return parseEndDeviceObject(object);
}

// oxlint-disable-next-line @typescript-eslint/no-explicit-any
export function parseEndDeviceObject(endDeviceObject: any): EndDevice {
    /* oxlint-disable @typescript-eslint/no-unsafe-member-access */
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
    const registrationLink = endDeviceObject['RegistrationLink']
        ? parseLinkXmlObject(endDeviceObject['RegistrationLink'][0])
        : undefined;
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
    /* oxlint-enable @typescript-eslint/no-unsafe-member-access */

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
            lFDI,
            sFDI,
            changedTime: dateToStringSeconds(changedTime),
            enabled: booleanToString(enabled),
        },
    };
}
