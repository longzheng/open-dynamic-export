import { assertArray } from '../helpers/assert.js';
import type { DER } from './der.js';
import { parseDerXmlObject } from './der.js';
import { parseListXmlObject, type List } from './list.js';
import { parsePollRateXmlObject, type PollRate } from './pollRate.js';

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
