import { numberToHex } from '../../helpers/number.js';
import { assertString } from '../helpers/assert.js';
import { xmlns } from '../helpers/namespace.js';
import {
    generateMirrorMeterReadingObject,
    type MirrorMeterReading,
} from './mirrorMeterReading.js';
import { parsePostRateXmlObject, type PostRate } from './postRate.js';
import {
    parseUsagePointBaseXmlObject,
    type UsagePointBase,
} from './usagePointBase.js';

export type MirrorUsagePoint = {
    postRate?: PostRate;
    deviceLFDI: string;
    mirrorMeterReading?: MirrorMeterReading[];
} & UsagePointBase;

export function parseMirrorUsagePointXml(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xml: any,
): MirrorUsagePoint {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const xmlObject = parseMirrorUsagePointXmlObject(xml['MirrorUsagePoint']);
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        ...xmlObject,
    };
}

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
    mirrorMeterReading,
}: MirrorUsagePoint) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: { MirrorUsagePoint: any } = {
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

    if (mirrorMeterReading) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        response.MirrorUsagePoint.MirrorMeterReading = mirrorMeterReading.map(
            (reading) => generateMirrorMeterReadingObject(reading),
        );
    }

    return response;
}
