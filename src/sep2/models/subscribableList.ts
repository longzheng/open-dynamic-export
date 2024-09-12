import { parseListXmlObject, type List } from './list.js';
import {
    parseSubscribableResourceXmlObject,
    type SubscribableResource,
} from './subscribableResource.js';

export type SubscribableList = List & SubscribableResource;

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
