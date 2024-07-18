import { stringHexToEnumType } from '../enum';
import { assertString } from './assert';
import { type ResponseRequiredType } from './responseRequired';

export type RespondableResource = {
    replyToHref: string;
    responseRequired: ResponseRequiredType;
};

export function parseRespondableResourceXmlObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): RespondableResource {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
    const replyToHref = assertString(xmlObject['$']['replyTo']);
    const responseRequired = stringHexToEnumType<ResponseRequiredType>(
        assertString(xmlObject['$']['responseRequired']),
    );
    /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

    return {
        replyToHref,
        responseRequired,
    };
}
