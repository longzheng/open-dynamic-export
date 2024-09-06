import { assertArray, assertString } from '../helpers/assert';
import { stringToBoolean } from '../helpers/boolean';
import { parseEndDeviceObject, type EndDevice } from './endDevice';
import type { PollRate } from './pollRate';
import { parsePollRateXmlObject } from './pollRate';
import {
    parseSubscribableListXmlObject,
    type SubscribableList,
} from './subscribableList';

export type EndDeviceList = {
    pollRate: PollRate;
    endDevices: EndDevice[];
} & SubscribableList;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseEndDeviceListXml(xml: any): EndDeviceList {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const subscribableList = parseSubscribableListXmlObject(
        xml['EndDeviceList'],
    );
    const pollRate = parsePollRateXmlObject(xml['EndDeviceList']);
    const subscribable = stringToBoolean(
        assertString(xml['EndDeviceList']['$']['subscribable']),
    );
    const endDeviceArray = assertArray(xml['EndDeviceList']['EndDevice']);
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

    const endDevices = endDeviceArray.map((endDeviceXml) =>
        parseEndDeviceObject(endDeviceXml),
    );

    return {
        ...subscribableList,
        pollRate,
        subscribable,
        endDevices,
    };
}
