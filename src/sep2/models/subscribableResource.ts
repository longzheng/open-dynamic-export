import { assertString } from '../helpers/assert';
import { stringIntToBoolean } from '../helpers/boolean';
import { parseResourceXmlObject, type Resource } from './resource';

export type SubscribableResource = { subscribable: boolean } & Resource;

export function parseSubscribableResourceXmlObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): SubscribableResource {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const resource = parseResourceXmlObject(xmlObject);
    const subscribable = xmlObject['$']['subscribable']
        ? stringIntToBoolean(assertString(xmlObject['$']['subscribable']))
        : false;
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        ...resource,
        subscribable,
    };
}
