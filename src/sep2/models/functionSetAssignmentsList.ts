import * as v from 'valibot';
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

export const functionSetAssignmentsListSchema = v.intersect([
    v.object({
        pollRate: pollRateSchema,
        functionSetAssignments: v.array(functionSetAssignmentsSchema),
    }),
    subscribableListSchema,
]);

export type FunctionSetAssignmentsList = v.InferOutput<
    typeof functionSetAssignmentsListSchema
>;

export function parseFunctionSetAssignmentsListXml(
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any
    xml: any,
): FunctionSetAssignmentsList {
    /* oxlint-disable @typescript-eslint/no-unsafe-member-access */
    const subscribableList = parseSubscribableListXmlObject(
        xml['FunctionSetAssignmentsList'],
    );
    const pollRate = parsePollRateXmlObject(xml['FunctionSetAssignmentsList']);
    const functionSetAssignmentsArray = assertArray(
        xml['FunctionSetAssignmentsList']['FunctionSetAssignments'],
    );
    /* oxlint-enable @typescript-eslint/no-unsafe-member-access */

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
