import { numberToHex } from '../../number';
import type { CommodityType } from './commodityType';
import type { DataQualifierType } from './dataQualifierType';
import { dateToStringSeconds } from '../helpers/date';
import type { FlowDirectionType } from './flowDirectionType';
import type { KindType } from './kindType';
import { xmlns } from '../helpers/namespace';
import type { PhaseCode } from './phaseCode';
import type { QualityFlags } from './qualityFlags';
import type { UomType } from './uomType';

export type MirrorMeterReading = {
    mRID: string;
    description: string;
    lastUpdateTime: Date;
    nextUpdateTime: Date;
    version: number;
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
};

export function generateMirrorMeterReadingResponse({
    mRID,
    description,
    lastUpdateTime,
    nextUpdateTime,
    version,
    Reading,
    ReadingType,
}: MirrorMeterReading) {
    return {
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
                phase: ReadingType.phase,
                powerOfTenMultiplier: ReadingType.powerOfTenMultiplier,
                intervalLength: ReadingType.intervalLength,
                uom: ReadingType.uom,
            },
        },
    };
}
