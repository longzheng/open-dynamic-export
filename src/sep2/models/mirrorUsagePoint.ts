import { numberToHex } from '../../helpers/number.js';
import { assertString } from '../helpers/assert.js';
import { xmlns } from '../helpers/namespace.js';
import {
    generateMirrorMeterReadingObject,
    mirrorMeterReadingSchema,
} from './mirrorMeterReading.js';
import { parsePostRateXmlObject, postRateSchema } from './postRate.js';
import {
    parseUsagePointBaseXmlObject,
    usagePointBaseSchema,
} from './usagePointBase.js';
import { z } from 'zod';

export const mirrorUsagePointSchema = z
    .object({
        postRate: postRateSchema.optional(),
        deviceLFDI: z.string(),
        mirrorMeterReading: mirrorMeterReadingSchema.array().optional(),
    })
    .merge(usagePointBaseSchema);

export type MirrorUsagePoint = z.infer<typeof mirrorUsagePointSchema>;

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
    return {
        MirrorUsagePoint: {
            $: { xmlns: xmlns._ },
            mRID,
            description,
            roleFlags: numberToHex(roleFlags).padStart(2, '0'),
            serviceCategoryKind,
            status,
            deviceLFDI,
            MirrorMeterReading: mirrorMeterReading?.map((reading) =>
                generateMirrorMeterReadingObject(reading),
            ),
        },
    };
}
