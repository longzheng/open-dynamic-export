import {
    safeParseStringToEnumType,
    stringHexToEnumType,
} from '../../helpers/enum.js';
import { assertString } from '../helpers/assert.js';
import {
    parseIdentifiedObjectXmlObject,
    type IdentifiedObject,
} from './identifiedObject.js';
import type { RoleFlagsType } from './roleFlagsType.js';
import { ServiceKind } from './serviceKind.js';

export enum UsagePointBaseStatus {
    Off = '0',
    On = '1',
}

export type UsagePointBase = {
    roleFlags: RoleFlagsType;
    serviceCategoryKind: ServiceKind;
    status: UsagePointBaseStatus;
} & IdentifiedObject;

export function parseUsagePointBaseXmlObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): UsagePointBase {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const identifiedObject = parseIdentifiedObjectXmlObject(xmlObject);
    const roleFlags = stringHexToEnumType<RoleFlagsType>(
        assertString(xmlObject['roleFlags'][0]),
    );
    const serviceCategoryKind = safeParseStringToEnumType(
        assertString(xmlObject['serviceCategoryKind'][0]),
        ServiceKind,
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const status = safeParseStringToEnumType(
        assertString(xmlObject['status'][0]),
        UsagePointBaseStatus,
    );
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        ...identifiedObject,
        roleFlags,
        serviceCategoryKind,
        status,
    };
}
