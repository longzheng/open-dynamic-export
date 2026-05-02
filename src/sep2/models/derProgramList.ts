import * as v from 'valibot';
import { assertArray } from '../helpers/assert.js';
import { parsePollRateXmlObject, pollRateSchema } from './pollRate.js';
import { derProgramSchema, parseDERProgramXmlObject } from './derProgram.js';
import {
    parseSubscribableListXmlObject,
    subscribableListSchema,
} from './subscribableList.js';

export const derProgramListSchema = v.intersect([
    v.object({
        pollRate: pollRateSchema,
        derPrograms: v.array(derProgramSchema),
    }),
    subscribableListSchema,
]);

export type DERProgramList = v.InferOutput<typeof derProgramListSchema>;

export function parseDerProgramListXml(
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any
    xml: any,
): DERProgramList {
    /* oxlint-disable @typescript-eslint/no-unsafe-member-access */
    const subscribableList = parseSubscribableListXmlObject(
        xml['DERProgramList'],
    );
    const pollRate = parsePollRateXmlObject(xml['DERProgramList']);
    const derProgramArray = assertArray(xml['DERProgramList']['DERProgram']);
    /* oxlint-enable @typescript-eslint/no-unsafe-member-access */

    const derPrograms = derProgramArray.map((derProgramXmlObject) =>
        parseDERProgramXmlObject(derProgramXmlObject),
    );

    return {
        ...subscribableList,
        pollRate,
        derPrograms,
    };
}
