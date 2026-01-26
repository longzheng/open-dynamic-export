import * as v from 'valibot';
import { coerceDateSchema } from '../../helpers/valibot.js';
import { numberToHex } from '../../helpers/number.js';
import { dateToStringSeconds } from '../helpers/date.js';
import { xmlns } from '../helpers/namespace.js';
import { commodityTypeSchema } from './commodityType.js';
import { dataQualifierTypeSchema } from './dataQualifierType.js';
import { flowDirectionTypeSchema } from './flowDirectionType.js';
import { kindTypeSchema } from './kindType.js';
import { PhaseCode, phaseCodeSchema } from './phaseCode.js';
import { qualityFlagsSchema } from './qualityFlags.js';
import { uomTypeSchema } from './uomType.js';
import { identifiedObjectSchema } from './identifiedObject.js';
import { dateTimeIntervalSchema } from './dateTimeInterval.js';

export const mirrorMeterReadingSchema = v.intersect([
    v.object({
        lastUpdateTime: v.optional(coerceDateSchema),
        nextUpdateTime: v.optional(coerceDateSchema),
        Reading: v.optional(
            v.object({
                timePeriod: v.optional(dateTimeIntervalSchema),
                qualityFlags: v.optional(qualityFlagsSchema),
                value: v.number(),
            }),
        ),
        ReadingType: v.optional(
            v.object({
                commodity: commodityTypeSchema,
                kind: kindTypeSchema,
                dataQualifier: dataQualifierTypeSchema,
                flowDirection: flowDirectionTypeSchema,
                phase: phaseCodeSchema,
                powerOfTenMultiplier: v.number(),
                intervalLength: v.optional(v.number()),
                uom: uomTypeSchema,
            }),
        ),
    }),
    identifiedObjectSchema,
]);

export type MirrorMeterReading = v.InferOutput<typeof mirrorMeterReadingSchema>;

export function generateMirrorMeterReadingResponse(
    mirrorMeterReading: MirrorMeterReading,
) {
    // Validate input against schema
    const validatedInput = v.parse(mirrorMeterReadingSchema, mirrorMeterReading);

    const response = {
        MirrorMeterReading: {
            $: { xmlns: xmlns._ },
            ...generateMirrorMeterReadingObject(validatedInput),
        },
    };

    return response;
}

// MirrorMeterReading object to be nested inside MirrorUsagePoint
export function generateMirrorMeterReadingObject(
    mirrorMeterReading: MirrorMeterReading,
) {
    // Validate input against schema
    const {
        mRID,
        description,
        lastUpdateTime,
        nextUpdateTime,
        version,
        Reading,
        ReadingType,
    } = v.parse(mirrorMeterReadingSchema, mirrorMeterReading);

    return {
        mRID,
        description,
        version,
        lastUpdateTime: lastUpdateTime
            ? dateToStringSeconds(lastUpdateTime)
            : undefined,
        nextUpdateTime: nextUpdateTime
            ? dateToStringSeconds(nextUpdateTime)
            : undefined,
        Reading: Reading
            ? {
                  qualityFlags: Reading.qualityFlags
                      ? numberToHex(Reading.qualityFlags).padStart(4, '0')
                      : undefined,
                  timePeriod: Reading.timePeriod
                      ? {
                            // ensure integer value
                            duration: Math.round(Reading.timePeriod.duration),
                            start: dateToStringSeconds(
                                Reading.timePeriod.start,
                            ),
                        }
                      : undefined,
                  value: Reading.value,
              }
            : undefined,
        ReadingType: ReadingType
            ? {
                  commodity: ReadingType.commodity,
                  dataQualifier: ReadingType.dataQualifier,
                  flowDirection: ReadingType.flowDirection,
                  intervalLength:
                      ReadingType.intervalLength !== undefined
                          ? ReadingType.intervalLength
                          : undefined,
                  kind: ReadingType.kind,
                  // the SEP2 server can't seem to handle phase code 0 even though it is documented as a valid value
                  // conditionally set phase if it's not 0
                  phase:
                      ReadingType.phase !== PhaseCode.NotApplicable
                          ? ReadingType.phase
                          : undefined,
                  powerOfTenMultiplier: ReadingType.powerOfTenMultiplier,
                  uom: ReadingType.uom,
              }
            : undefined,
    };
}
