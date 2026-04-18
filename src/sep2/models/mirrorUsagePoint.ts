import * as v from 'valibot';
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

export const mirrorUsagePointSchema = v.intersect([
    v.object({
        postRate: v.optional(postRateSchema),
        deviceLFDI: v.string(),
        mirrorMeterReading: v.optional(v.array(mirrorMeterReadingSchema)),
    }),
    usagePointBaseSchema,
]);

export type MirrorUsagePoint = v.InferOutput<typeof mirrorUsagePointSchema>;

export function parseMirrorUsagePointXml(
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any
    xml: any,
): MirrorUsagePoint {
    /* oxlint-disable @typescript-eslint/no-unsafe-member-access */
    const xmlObject = parseMirrorUsagePointXmlObject(xml['MirrorUsagePoint']);
    /* oxlint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        ...xmlObject,
    };
}

export function parseMirrorUsagePointXmlObject(
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any
    mirrorUsagePointObject: any,
): MirrorUsagePoint {
    /* oxlint-disable @typescript-eslint/no-unsafe-member-access */
    const usagePointBase = parseUsagePointBaseXmlObject(mirrorUsagePointObject);
    const postRate = parsePostRateXmlObject(mirrorUsagePointObject);
    const deviceLFDI = assertString(mirrorUsagePointObject['deviceLFDI'][0]);
    /* oxlint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        ...usagePointBase,
        postRate,
        deviceLFDI,
    };
}

export function generateMirrorUsagePointResponse(
    mirrorUsagePoint: MirrorUsagePoint,
) {
    const {
        mRID,
        description,
        roleFlags,
        serviceCategoryKind,
        status,
        deviceLFDI,
        mirrorMeterReading,
    } = v.parse(mirrorUsagePointSchema, mirrorUsagePoint);

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
