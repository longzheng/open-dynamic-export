import { numberToHex } from '../../helpers/number.js';
import { commodityTypeSchema } from './commodityType.js';
import { dataQualifierTypeSchema } from './dataQualifierType.js';
import { dateToStringSeconds } from '../helpers/date.js';
import { flowDirectionTypeSchema } from './flowDirectionType.js';
import { kindTypeSchema } from './kindType.js';
import { xmlns } from '../helpers/namespace.js';
import { PhaseCode, phaseCodeSchema } from './phaseCode.js';
import { qualityFlagsSchema } from './qualityFlags.js';
import { uomTypeSchema } from './uomType.js';
import { identifiedObjectSchema } from './identifiedObject.js';
import { dateTimeIntervalSchema } from './dateTimeInterval.js';
import { z } from 'zod';

export const mirrorMeterReadingSchema = z
    .object({
        lastUpdateTime: z.date().optional(),
        nextUpdateTime: z.date().optional(),
        Reading: z
            .object({
                timePeriod: dateTimeIntervalSchema.optional(),
                qualityFlags: qualityFlagsSchema.optional(),
                value: z.number(),
            })
            .optional(),
        ReadingType: z
            .object({
                commodity: commodityTypeSchema,
                kind: kindTypeSchema,
                dataQualifier: dataQualifierTypeSchema,
                flowDirection: flowDirectionTypeSchema,
                phase: phaseCodeSchema,
                powerOfTenMultiplier: z.number(),
                intervalLength: z.number().optional(),
                uom: uomTypeSchema,
            })
            .optional(),
    })
    .merge(identifiedObjectSchema);

export type MirrorMeterReading = z.infer<typeof mirrorMeterReadingSchema>;

export function generateMirrorMeterReadingResponse(
    mirrorMeterReading: MirrorMeterReading,
) {
    const response = {
        MirrorMeterReading: {
            $: { xmlns: xmlns._ },
            ...generateMirrorMeterReadingObject(mirrorMeterReading),
        },
    };

    return response;
}

// MirrorMeterReading object to be nested inside MirrorUsagePoint
export function generateMirrorMeterReadingObject({
    mRID,
    description,
    lastUpdateTime,
    nextUpdateTime,
    version,
    Reading,
    ReadingType,
}: MirrorMeterReading) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: Record<string, any> = {
        mRID,
    };

    if (description) {
        response['description'] = description;
    }

    if (lastUpdateTime) {
        response['lastUpdateTime'] = dateToStringSeconds(lastUpdateTime);
    }

    if (nextUpdateTime) {
        response['nextUpdateTime'] = dateToStringSeconds(nextUpdateTime);
    }

    if (version !== undefined) {
        response['version'] = version;
    }

    if (Reading) {
        response['Reading'] = {
            value: Reading.value,
        };

        if (Reading.qualityFlags) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            response['Reading']['qualityFlags'] = numberToHex(
                Reading.qualityFlags,
            ).padStart(4, '0');
        }

        if (Reading.timePeriod) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            response['Reading']['timePeriod'] = {
                start: dateToStringSeconds(Reading.timePeriod.start),
                duration: Reading.timePeriod.duration,
            };
        }
    }

    if (ReadingType) {
        response['ReadingType'] = {
            commodity: ReadingType.commodity,
            kind: ReadingType.kind,
            dataQualifier: ReadingType.dataQualifier,
            flowDirection: ReadingType.flowDirection,
            powerOfTenMultiplier: ReadingType.powerOfTenMultiplier,
            uom: ReadingType.uom,
        };

        if (ReadingType.intervalLength !== undefined) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            response['ReadingType'].intervalLength = ReadingType.intervalLength;
        }

        // the SEP2 server can't seem to handle phase code 0 even though it is documented as a valid value
        // conditionally set phase if it's not 0
        // {
        //     "error": true,
        //     "statusCode": "ERR-MONITOR-0000",
        //     "statusMessage": "Unknown 0 Phase Code!"
        //   }
        if (ReadingType.phase !== PhaseCode.NotApplicable) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            response['ReadingType'].phase = ReadingType.phase;
        }
    }

    return response;
}
