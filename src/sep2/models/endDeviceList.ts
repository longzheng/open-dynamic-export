import { assertArray } from '../helpers/assert.js';
import { parseEndDeviceObject, type EndDevice } from './endDevice.js';
import type { PollRate } from './pollRate.js';
import { parsePollRateXmlObject } from './pollRate.js';
import {
    parseSubscribableListXmlObject,
    type SubscribableList,
} from './subscribableList.js';

export type EndDeviceList = {
    pollRate: PollRate;
    endDevices: EndDevice[];
} & SubscribableList;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseEndDeviceListXml(xml: any): EndDeviceList {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const subscribableList = parseSubscribableListXmlObject(
        xml['EndDeviceList'],
    );
    const pollRate = parsePollRateXmlObject(xml['EndDeviceList']);
    const endDeviceArray = assertArray(xml['EndDeviceList']['EndDevice']);
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    const endDevices = endDeviceArray.map((endDeviceXml) =>
        parseEndDeviceObject(endDeviceXml),
    );

    return {
        ...subscribableList,
        pollRate,
        endDevices,
    };
}
