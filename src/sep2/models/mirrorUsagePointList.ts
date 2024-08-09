import { assertArray } from '../helpers/assert';
import { parseListXmlObject, type List } from './list';
import type { MirrorUsagePoint } from './mirrorUsagePoint';
import { parseMirrorUsagePointXmlObject } from './mirrorUsagePoint';
import type { PollRate } from './pollRate';
import { parsePollRateXmlObject } from './pollRate';

export type MirrorUsagePointList = {
    pollRate: PollRate;
    mirrorUsagePoints: MirrorUsagePoint[];
} & List;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseMirrorUsagePointListXml(xml: any): MirrorUsagePointList {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const list = parseListXmlObject(xml['MirrorUsagePointList']);
    const pollRate = parsePollRateXmlObject(xml['MirrorUsagePointList']);
    const mirrorUsagePointArray = assertArray(
        xml['MirrorUsagePointList']['MirrorUsagePoint'],
    );
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

    const mirrorUsagePoints = mirrorUsagePointArray.map((mirrorUsagePoint) =>
        parseMirrorUsagePointXmlObject(mirrorUsagePoint),
    );

    return {
        ...list,
        pollRate,
        mirrorUsagePoints,
    };
}
