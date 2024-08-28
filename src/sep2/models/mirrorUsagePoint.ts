import { numberToHex } from '../../helpers/number';
import { assertString } from '../helpers/assert';
import { xmlns } from '../helpers/namespace';
import { parsePostRateXmlObject, type PostRate } from './postRate';
import {
    parseUsagePointBaseXmlObject,
    type UsagePointBase,
} from './usagePointBase';

export type MirrorUsagePoint = {
    postRate?: PostRate;
    deviceLFDI: string;
} & UsagePointBase;

export function parseMirrorUsagePointXmlObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mirrorUsagePointObject: any,
): MirrorUsagePoint {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const usagePointBase = parseUsagePointBaseXmlObject(mirrorUsagePointObject);
    const postRate = parsePostRateXmlObject(mirrorUsagePointObject);
    const deviceLFDI = assertString(mirrorUsagePointObject['deviceLFDI'][0]);
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        ...usagePointBase,
        postRate,
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
