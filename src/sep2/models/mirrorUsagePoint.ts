import { safeParseStringToEnumType, stringHexToEnumType } from '../../enum';
import { numberToHex } from '../../number';
import { assertString } from '../helpers/assert';
import { xmlns } from '../helpers/namespace';
import {
    parseIdentifiedObjectXmlObject,
    type IdentifiedObject,
} from './identifiedObject';
import { parsePostRateXmlObject, type PostRate } from './postRate';
import { type RoleFlagsType } from './roleFlagsType';
import { ServiceKind } from './serviceKind';

export enum MirrorUsagePointStatus {
    Off = '0',
    On = '1',
}

// A suggested naming pattern for the Usage Point mRID(s) could include a truncated LFDI with the role flags, in addition to a PEN.
export type MirrorUsagePoint = {
    postRate?: PostRate;
    roleFlags: RoleFlagsType;
    serviceCategoryKind: ServiceKind;
    status: MirrorUsagePointStatus;
    deviceLFDI: string;
} & IdentifiedObject; // TODO this should be UsagePointBase

export function parseMirrorUsagePointXmlObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mirrorUsagePointObject: any,
): MirrorUsagePoint {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const identifiedObject = parseIdentifiedObjectXmlObject(
        mirrorUsagePointObject,
    );
    const postRate = parsePostRateXmlObject(mirrorUsagePointObject);
    const roleFlags = stringHexToEnumType<RoleFlagsType>(
        assertString(mirrorUsagePointObject['roleFlags'][0]),
    );
    const serviceCategoryKind = safeParseStringToEnumType(
        assertString(mirrorUsagePointObject['serviceCategoryKind'][0]),
        ServiceKind,
    );
    const status = safeParseStringToEnumType(
        assertString(mirrorUsagePointObject['status'][0]),
        MirrorUsagePointStatus,
    );
    const deviceLFDI = assertString(mirrorUsagePointObject['deviceLFDI'][0]);
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        ...identifiedObject,
        postRate,
        roleFlags,
        serviceCategoryKind,
        status,
        deviceLFDI,
    };
}

export function generateMirrorUsagePointResponse({
    mRID,
    description,
    roleFlags,
    serviceCategoryKind,
    status,
    deviceLFDI,
}: MirrorUsagePoint) {
    return {
        MirrorUsagePoint: {
            $: { xmlns: xmlns._ },
            mRID,
            description,
            roleFlags: numberToHex(roleFlags).padStart(2, '0'),
            serviceCategoryKind,
            status,
            deviceLFDI,
        },
    };
}
