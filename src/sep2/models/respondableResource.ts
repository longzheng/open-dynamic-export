import { stringHexToEnumType } from '../../helpers/enum.js';
import { assertString } from '../helpers/assert.js';
import { parseResourceXmlObject, type Resource } from './resource.js';
import { type ResponseRequiredType } from './responseRequired.js';

export type RespondableResource = {
    replyToHref?: string;
    responseRequired: ResponseRequiredType;
} & Resource;

export function parseRespondableResourceXmlObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): RespondableResource {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
    const resource = parseResourceXmlObject(xmlObject);
    const replyToHref = xmlObject['$']['replyTo']
        ? assertString(xmlObject['$']['replyTo'])
        : undefined;
    const responseRequired = stringHexToEnumType<ResponseRequiredType>(
        assertString(xmlObject['$']['responseRequired']),
    );
    /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

    return {
        ...resource,
        replyToHref,
        responseRequired,
    };
}
