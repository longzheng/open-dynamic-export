import * as v from 'valibot';
import { listSchema, parseListXmlObject } from './list.js';
import {
    parseSubscribableResourceXmlObject,
    subscribableResourceSchema,
} from './subscribableResource.js';

export const subscribableListSchema = v.intersect([
    listSchema,
    subscribableResourceSchema,
]);

export type SubscribableList = v.InferOutput<typeof subscribableListSchema>;

export function parseSubscribableListXmlObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): SubscribableList {
    const list = parseListXmlObject(xmlObject);
    const subscriableResource = parseSubscribableResourceXmlObject(xmlObject);

    return {
        ...list,
        ...subscriableResource,
    };
}
