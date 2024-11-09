import { listSchema, parseListXmlObject } from './list.js';
import {
    parseSubscribableResourceXmlObject,
    subscribableResourceSchema,
} from './subscribableResource.js';
import { type z } from 'zod';

export const subscribableListSchema = listSchema.merge(
    subscribableResourceSchema,
);

export type SubscribableList = z.infer<typeof subscribableListSchema>;

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
