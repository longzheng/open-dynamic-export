import { parseListXmlObject, type List } from './list';
import {
    parseSubscribableResourceXmlObject,
    type SubscribableResource,
} from './subscribableResource';

export type SubscribableList = List & SubscribableResource;

export function parseSubscribableListXmlObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): SubscribableList {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const list = parseListXmlObject(xmlObject);
    const subscriableResource = parseSubscribableResourceXmlObject(xmlObject);
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        ...list,
        ...subscriableResource,
    };
}
