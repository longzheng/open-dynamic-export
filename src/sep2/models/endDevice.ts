import { assertString } from '../helpers/assert';
import { stringIntToBoolean, stringToBoolean } from '../helpers/boolean';
import { stringIntToDate } from '../helpers/date';
import { parseLinkXmlObject, type Link } from './link';

export type EndDevice = EndDeviceBase & (EndDeviceDer | EndDeviceAggregator);

type EndDeviceBase = {
    subscribeable: boolean;
    lFDI: string;
    logEventListLink: Link;
    sFDI: string;
    changedTime: Date;
    registrationLink: Link;
};

type EndDeviceDer = {
    type: 'der';
    derListLink: Link;
    enabled: boolean;
    functionSetAssignmentsListLink: Link;
};

type EndDeviceAggregator = {
    type: 'aggregator';
    subscriptionListLink: Link;
};

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
    const subscribeable = stringIntToBoolean(
        assertString(endDeviceObject['$']['subscribable']),
    );
    const lFDI = assertString(endDeviceObject['lFDI'][0]);
    const logEventListLink = parseLinkXmlObject(
        endDeviceObject['LogEventListLink'][0],
    );
    const sFDI = assertString(endDeviceObject['sFDI'][0]);
    const changedTime = stringIntToDate(
        assertString(endDeviceObject['changedTime'][0]),
    );
    const registrationLink = parseLinkXmlObject(
        endDeviceObject['RegistrationLink'][0],
    );
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    const endDeviceType: EndDeviceDer | EndDeviceAggregator = (() => {
        // DER devices have DERListLink
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const derListLinkObject = endDeviceObject['DERListLink'];
        if (derListLinkObject) {
            /* eslint-disable @typescript-eslint/no-unsafe-member-access */
            const derListLink = parseLinkXmlObject(derListLinkObject[0]);
            const enabled = stringToBoolean(
                assertString(endDeviceObject['enabled'][0]),
            );
            const functionSetAssignmentsListLink = parseLinkXmlObject(
                endDeviceObject['FunctionSetAssignmentsListLink'][0],
            );
            /* eslint-enable @typescript-eslint/no-unsafe-member-access */

            return {
                type: 'der',
                derListLink,
                enabled,
                functionSetAssignmentsListLink,
            };
        }

        // Aggregator devices have SubscriptionListLink
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const subscriptionListLinkObject =
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            endDeviceObject['SubscriptionListLink'];
        if (subscriptionListLinkObject) {
            /* eslint-disable @typescript-eslint/no-unsafe-member-access */
            const subscriptionListLink = parseLinkXmlObject(
                subscriptionListLinkObject[0],
            );
            /* eslint-enable @typescript-eslint/no-unsafe-member-access */

            return {
                type: 'aggregator',
                subscriptionListLink,
            };
        }

        throw new Error('unknown end device type');
    })();

    return {
        subscribeable,
        lFDI,
        logEventListLink,
        sFDI,
        changedTime,
        registrationLink,
        ...endDeviceType,
    };
}
