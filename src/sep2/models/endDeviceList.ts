import * as v from 'valibot';
import { assertArray } from '../helpers/assert.js';
import { endDeviceSchema, parseEndDeviceObject } from './endDevice.js';
import { parsePollRateXmlObject, pollRateSchema } from './pollRate.js';
import {
    parseSubscribableListXmlObject,
    subscribableListSchema,
} from './subscribableList.js';

export const endDeviceListSchema = v.intersect([
    v.object({
        pollRate: pollRateSchema,
        endDevices: v.array(endDeviceSchema),
    }),
    subscribableListSchema,
]);

export type EndDeviceList = v.InferOutput<typeof endDeviceListSchema>;

// oxlint-disable-next-line @typescript-eslint/no-explicit-any
export function parseEndDeviceListXml(xml: any): EndDeviceList {
    /* oxlint-disable @typescript-eslint/no-unsafe-member-access */
    const subscribableList = parseSubscribableListXmlObject(
        xml['EndDeviceList'],
    );
    const pollRate = parsePollRateXmlObject(xml['EndDeviceList']);
    const endDeviceArray = assertArray(xml['EndDeviceList']['EndDevice']);
    /* oxlint-enable @typescript-eslint/no-unsafe-member-access */

    const endDevices = endDeviceArray.map((endDeviceXml) =>
        parseEndDeviceObject(endDeviceXml),
    );

    return {
        ...subscribableList,
        pollRate,
        endDevices,
    };
}
