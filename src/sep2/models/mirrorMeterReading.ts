import { numberToHex } from '../../helpers/number.js';
import type { CommodityType } from './commodityType.js';
import type { DataQualifierType } from './dataQualifierType.js';
import { dateToStringSeconds } from '../helpers/date.js';
import type { FlowDirectionType } from './flowDirectionType.js';
import type { KindType } from './kindType.js';
import { xmlns } from '../helpers/namespace.js';
import { PhaseCode } from './phaseCode.js';
import type { QualityFlags } from './qualityFlags.js';
import type { UomType } from './uomType.js';
import type { IdentifiedObject } from './identifiedObject.js';
import type { DateTimeInterval } from './dateTimeInterval.js';

export type MirrorMeterReading = {
    lastUpdateTime: Date;
    nextUpdateTime: Date;
    Reading?: {
        timePeriod?: DateTimeInterval;
        qualityFlags?: QualityFlags;
        value: number;
    };
    ReadingType?: {
        commodity: CommodityType;
        kind: KindType;
        dataQualifier: DataQualifierType;
        flowDirection: FlowDirectionType;
        phase: PhaseCode;
        powerOfTenMultiplier: number;
        intervalLength: number;
        uom: UomType;
    };
} & IdentifiedObject;

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
        description,
        lastUpdateTime: dateToStringSeconds(lastUpdateTime),
        nextUpdateTime: dateToStringSeconds(nextUpdateTime),
        version,
    };

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
            intervalLength: ReadingType.intervalLength,
            powerOfTenMultiplier: ReadingType.powerOfTenMultiplier,
            uom: ReadingType.uom,
        };

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
