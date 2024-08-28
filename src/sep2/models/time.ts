import { safeParseStringToEnumType } from '../../helpers/enum';
import { safeParseIntString } from '../../helpers/number';
import { assertString } from '../helpers/assert';
import { stringIntToDate } from '../helpers/date';
import { parsePollRateXmlObject, type PollRate } from './pollRate';
import { parseResourceXmlObject, type Resource } from './resource';

// 3 = Time obtained from external authoritative source such as NTP
// 4 = Time obtained from level 3 source
// 5 = Time manually set or obtained from level 4 source
// 6 = Time obtained from level 5 source
// 7 = Time intentionally uncoordinated
export enum TimeQuality {
    External = '3',
    Level3 = '4',
    Level4 = '5',
    Level5 = '6',
    Uncoordinated = '7',
}

export type Time = {
    pollRate: PollRate;
    currentTime: Date;
    dstEndTime: Date;
    dstOffset: number;
    dstStartTime: Date;
    localTime?: Date;
    quality: TimeQuality;
    tzOffset: number;
} & Resource;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseTimeXml(xml: any): Time {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const resource = parseResourceXmlObject(xml['Time']);
    const pollRate = parsePollRateXmlObject(xml['Time']);
    const currentTime = stringIntToDate(
        assertString(xml['Time']['currentTime'][0]),
    );
    const dstEndTime = stringIntToDate(
        assertString(xml['Time']['dstEndTime'][0]),
    );
    const dstOffset = safeParseIntString(
        assertString(xml['Time']['dstOffset'][0]),
    );
    const dstStartTime = stringIntToDate(
        assertString(xml['Time']['dstStartTime'][0]),
    );
    const localTime = xml['Time']['localTime']
        ? stringIntToDate(assertString(xml['Time']['localTime'][0]))
        : undefined;
    const quality = safeParseStringToEnumType(
        assertString(xml['Time']['quality'][0]),
        TimeQuality,
    );
    const tzOffset = safeParseIntString(
        assertString(xml['Time']['tzOffset'][0]),
    );
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        ...resource,
        pollRate,
        currentTime,
        dstEndTime,
        dstOffset,
        dstStartTime,
        localTime,
        quality,
        tzOffset,
    };
}
