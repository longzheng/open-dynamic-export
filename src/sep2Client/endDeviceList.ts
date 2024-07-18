import { assertArray, assertString } from './assert';
import { stringIntToBoolean } from './boolean';
import { parseEndDeviceObject, type EndDevice } from './endDevice';
import { parseListXmlObject, type List } from './list';

export type EndDeviceList = {
    list: List;
    subscribable: boolean;
    endDevices: EndDevice[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseEndDeviceListXml(xml: any): EndDeviceList {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const list = parseListXmlObject(xml['EndDeviceList']);
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
        subscribable,
        endDevices,
    };
}
