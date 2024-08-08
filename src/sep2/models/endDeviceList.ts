import { assertArray, assertString } from '../helpers/assert';
import { stringIntToBoolean } from '../helpers/boolean';
import { parseEndDeviceObject, type EndDevice } from './endDevice';
import { parseListXmlObject, type List } from './list';
import type { PollRate } from './pollRate';
import { parsePollRateXmlObject } from './pollRate';

export type EndDeviceList = {
    list: List;
    pollRate: PollRate;
    subscribable: boolean;
    endDevices: EndDevice[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseEndDeviceListXml(xml: any): EndDeviceList {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const list = parseListXmlObject(xml['EndDeviceList']);
    const pollRate = parsePollRateXmlObject(xml['EndDeviceList']);
    const subscribable = stringIntToBoolean(
        assertString(xml['EndDeviceList']['$']['subscribable']),
    );
    const endDeviceArray = assertArray(xml['EndDeviceList']['EndDevice']);
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

    const endDevices = endDeviceArray.map((endDeviceXml) =>
        parseEndDeviceObject(endDeviceXml),
    );

    return {
        list,
        pollRate,
        subscribable,
        endDevices,
    };
}
