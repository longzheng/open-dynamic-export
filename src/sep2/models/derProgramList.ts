import { assertArray } from '../helpers/assert.js';
import { parsePollRateXmlObject, type PollRate } from './pollRate.js';
import type { DERProgram } from './derProgram.js';
import { parseDERProgramXmlObject } from './derProgram.js';
import {
    parseSubscribableListXmlObject,
    type SubscribableList,
} from './subscribableList.js';

export type DERProgramList = {
    pollRate: PollRate;
    derPrograms: DERProgram[];
} & SubscribableList;

export function parseDerProgramListXml(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xml: any,
): DERProgramList {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const subscribableList = parseSubscribableListXmlObject(
        xml['DERProgramList'],
    );
    const pollRate = parsePollRateXmlObject(xml['DERProgramList']);
    const derProgramArray = assertArray(xml['DERProgramList']['DERProgram']);
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

    const derPrograms = derProgramArray.map((derProgramXmlObject) =>
        parseDERProgramXmlObject(derProgramXmlObject),
    );

    return {
        ...subscribableList,
        pollRate,
        derPrograms,
    };
}
