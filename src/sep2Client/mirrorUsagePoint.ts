import { assertString } from './assert';

export enum MirrorUsagePointRoleFlag {
    Site = '03',
    Der = '49',
}

export enum MirrorUsagePointStatus {
    Off = '0',
    On = '1',
}

export type MirrorUsagePoint = {
    mRID: string;
    description: string;
    roleFlags: MirrorUsagePointRoleFlag;
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
    const roleFlags = stringToRoleFlag(
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

function stringToRoleFlag(value: string): MirrorUsagePointRoleFlag {
    switch (value) {
        case '03':
            return MirrorUsagePointRoleFlag.Site;
        case '49':
            return MirrorUsagePointRoleFlag.Der;
        default:
            throw new Error(`Unexpected role flag: ${value}`);
    }
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
