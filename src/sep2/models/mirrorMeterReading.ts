import { numberToHex } from '../../number';
import type { CommodityType } from './commodityType';
import type { DataQualifierType } from './dataQualifierType';
import { dateToStringSeconds } from '../helpers/date';
import type { FlowDirectionType } from './flowDirectionType';
import type { KindType } from './kindType';
import { xmlns } from '../helpers/namespace';
import { PhaseCode } from './phaseCode';
import type { QualityFlags } from './qualityFlags';
import type { UomType } from './uomType';
import type { IdentifiedObject } from './identifiedObject';

// reading MRID should be a random UUIDv4 with the PEN
export type MirrorMeterReading = {
    lastUpdateTime: Date;
    nextUpdateTime: Date;
    Reading: {
        qualityFlags: QualityFlags;
        value: number;
    };
    ReadingType: {
        commodity: CommodityType;
        kind: KindType;
        dataQualifier: DataQualifierType;
        flowDirection: FlowDirectionType;
        phase: PhaseCode;
        powerOfTenMultiplier: number;
        // Default interval length specified in seconds.
        intervalLength: number;
        uom: UomType;
    };
} & IdentifiedObject; // TODO this should be MeterReadingBase

export function generateMirrorMeterReadingResponse({
    mRID,
    description,
    lastUpdateTime,
    nextUpdateTime,
    version,
    Reading,
    ReadingType,
}: MirrorMeterReading) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: { MirrorMeterReading: any } = {
        MirrorMeterReading: {
            $: { xmlns: xmlns._ },
            mRID,
            description,
            lastUpdateTime: dateToStringSeconds(lastUpdateTime),
            nextUpdateTime: dateToStringSeconds(nextUpdateTime),
            version,
            Reading: {
                qualityFlags: numberToHex(Reading.qualityFlags).padStart(
                    4,
                    '0',
                ),
                value: Reading.value,
            },
            ReadingType: {
                commodity: ReadingType.commodity,
                kind: ReadingType.kind,
                dataQualifier: ReadingType.dataQualifier,
                flowDirection: ReadingType.flowDirection,
                powerOfTenMultiplier: ReadingType.powerOfTenMultiplier,
                intervalLength: ReadingType.intervalLength,
                uom: ReadingType.uom,
            },
        },
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
        response.MirrorMeterReading.ReadingType.phase = ReadingType.phase;
    }

    return response;
}
