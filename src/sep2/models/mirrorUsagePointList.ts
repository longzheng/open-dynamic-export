import { safeParseIntString } from '../../number';
import { assertArray, assertString } from '../helpers/assert';
import type { MirrorUsagePoint } from './mirrorUsagePoint';
import { parseMirrorUsagePointXmlObject } from './mirrorUsagePoint';

export type MirrorUsagePointList = {
    all: number;
    results: number;
    mirrorUsagePoints: MirrorUsagePoint[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseMirrorUsagePointListXml(xml: any): MirrorUsagePointList {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const all = safeParseIntString(
        assertString(xml['MirrorUsagePointList']['$']['all']),
    );
    const results = safeParseIntString(
        assertString(xml['MirrorUsagePointList']['$']['results']),
    );
    const mirrorUsagePointArray = assertArray(
        xml['MirrorUsagePointList']['MirrorUsagePoint'],
    );
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

    const mirrorUsagePoints = mirrorUsagePointArray.map((mirrorUsagePoint) =>
        parseMirrorUsagePointXmlObject(mirrorUsagePoint),
    );

    return {
        all,
        results,
        mirrorUsagePoints,
    };
}
