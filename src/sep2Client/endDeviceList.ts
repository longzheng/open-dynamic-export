import { safeParseIntString } from '../number';
import { assertArray, assertString } from './assert';
import { stringIntToBoolean } from './boolean';
import { parseEndDeviceObject, type EndDevice } from './endDevice';

export type EndDeviceList = {
    all: number;
    results: number;
    subscribable: boolean;
    endDevices: EndDevice[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseEndDeviceListXml(xml: any): EndDeviceList {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const all = safeParseIntString(
        assertString(xml['EndDeviceList']['$']['all']),
    );
    const results = safeParseIntString(
        assertString(xml['EndDeviceList']['$']['results']),
    );
    const subscribable = stringIntToBoolean(
        assertString(xml['EndDeviceList']['$']['subscribable']),
    );
    const endDeviceArray = assertArray(xml['EndDeviceList']['EndDevice']);
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

    const endDevices = endDeviceArray.map((endDeviceXml) =>
        parseEndDeviceObject(endDeviceXml),
    );

    return {
        all,
        results,
        subscribable,
        endDevices,
    };
}
