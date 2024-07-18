import { stringHexToEnumType } from '../enum';
import { assertString } from './assert';
import { type RoleFlagsType } from './roleFlagsType';

export enum MirrorUsagePointStatus {
    Off = '0',
    On = '1',
}

export type MirrorUsagePoint = {
    mRID: string;
    description: string;
    roleFlags: RoleFlagsType;
    // TODO: unknown use?
    serviceCategoryKind: string;
    status: MirrorUsagePointStatus;
    deviceLFDI: string;
};

export function parseMirrorUsagePointXmlObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mirrorUsagePointObject: any,
): MirrorUsagePoint {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const mRID = assertString(mirrorUsagePointObject['mRID'][0]);
    const description = assertString(mirrorUsagePointObject['description'][0]);
    const roleFlags = stringHexToEnumType<RoleFlagsType>(
        assertString(mirrorUsagePointObject['roleFlags'][0]),
    );
    const serviceCategoryKind = assertString(
        mirrorUsagePointObject['serviceCategoryKind'][0],
    );
    const status = stringToStatus(
        assertString(mirrorUsagePointObject['status'][0]),
    );
    const deviceLFDI = assertString(mirrorUsagePointObject['deviceLFDI'][0]);
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        mRID,
        description,
        roleFlags,
        serviceCategoryKind,
        status,
        deviceLFDI,
    };
}

function stringToStatus(value: string): MirrorUsagePointStatus {
    switch (value) {
        case '1':
            return MirrorUsagePointStatus.On;
        case '0':
            return MirrorUsagePointStatus.Off;
        default:
            throw new Error(`Unexpected status: ${value}`);
    }
}
