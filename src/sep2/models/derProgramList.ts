import { assertArray } from '../helpers/assert';
import { parseListXmlObject, type List } from './list';
import { parsePollRateXmlObject, type PollRate } from './pollRate';
import type { DERProgram } from './derProgram';
import { parseDERProgramXmlObject } from './derProgram';

export type DERProgramList = {
    list: List;
    pollRate: PollRate;
    derPrograms: DERProgram[];
};

export function parseDerProgramListXml(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xml: any,
): DERProgramList {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const list = parseListXmlObject(xml['DERProgramList']);
    const pollRate = parsePollRateXmlObject(xml['DERProgramList']);
    const derProgramArray = assertArray(xml['DERProgramList']['DERProgram']);
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

    const derPrograms = derProgramArray.map((derProgramXmlObject) =>
        parseDERProgramXmlObject(derProgramXmlObject),
    );

    return {
        list,
        pollRate,
        derPrograms,
    };
}
