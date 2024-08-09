import { assertArray } from '../helpers/assert';
import type { DER } from './der';
import { parseDerXmlObject } from './der';
import { parseListXmlObject, type List } from './list';
import { parsePollRateXmlObject, type PollRate } from './pollRate';

export type DERList = {
    pollRate: PollRate;
    // link to the end device
    ders: DER[];
} & List;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseDerListXml(xml: any): DERList {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const list = parseListXmlObject(xml['DERList']);
    const pollRate = parsePollRateXmlObject(xml['DERList']);
    const derArray = assertArray(xml['DERList']['DER']);
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

    const ders = derArray.map((derXmlObject) =>
        parseDerXmlObject(derXmlObject),
    );

    return {
        ...list,
        pollRate,
        ders,
    };
}
