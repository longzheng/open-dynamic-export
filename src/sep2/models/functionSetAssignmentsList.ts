import { z } from 'zod';
import { assertArray } from '../helpers/assert.js';
import {
    functionSetAssignmentsSchema,
    parseFunctionSetAssignmentsXmlObject,
} from './functionSetAssignments.js';
import { parsePollRateXmlObject, pollRateSchema } from './pollRate.js';
import {
    parseSubscribableListXmlObject,
    subscribableListSchema,
} from './subscribableList.js';

export const functionSetAssignmentsListSchema = z
    .object({
        pollRate: pollRateSchema,
        functionSetAssignments: functionSetAssignmentsSchema.array(),
    })
    .merge(subscribableListSchema);

export type FunctionSetAssignmentsList = z.infer<
    typeof functionSetAssignmentsListSchema
>;

export function parseFunctionSetAssignmentsListXml(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xml: any,
): FunctionSetAssignmentsList {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const subscribableList = parseSubscribableListXmlObject(
        xml['FunctionSetAssignmentsList'],
    );
    const pollRate = parsePollRateXmlObject(xml['FunctionSetAssignmentsList']);
    const functionSetAssignmentsArray = assertArray(
        xml['FunctionSetAssignmentsList']['FunctionSetAssignments'],
    );
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    const functionSetAssignments = functionSetAssignmentsArray.map(
        (assignmentXmlObject) =>
            parseFunctionSetAssignmentsXmlObject(assignmentXmlObject),
    );

    return {
        ...subscribableList,
        pollRate,
        functionSetAssignments,
    };
}
