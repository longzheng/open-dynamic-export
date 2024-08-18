import { safeParseIntString } from '../../helpers/number';
import { assertString } from '../helpers/assert';
import { parseResourceXmlObject, type Resource } from './resource';

export type IdentifiedObject = {
    description?: string;
    mRID: string;
    version?: number;
} & Resource;

export function parseIdentifiedObjectXmlObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): IdentifiedObject {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const resource = parseResourceXmlObject(xmlObject);
    const mRID = assertString(xmlObject['mRID'][0]);
    const description = xmlObject['description']
        ? assertString(xmlObject['description'][0])
        : undefined;
    const version = xmlObject['version']
        ? safeParseIntString(assertString(xmlObject['version'][0]))
        : undefined;
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        ...resource,
        description,
        mRID,
        version,
    };
}
