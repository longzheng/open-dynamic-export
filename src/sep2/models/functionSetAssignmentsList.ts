import { assertArray } from '../helpers/assert.js';
import {
    parseFunctionSetAssignmentsXmlObject,
    type FunctionSetAssignments,
} from './functionSetAssignments.js';
import type { PollRate } from './pollRate.js';
import { parsePollRateXmlObject } from './pollRate.js';
import {
    parseSubscribableListXmlObject,
    type SubscribableList,
} from './subscribableList.js';

export type FunctionSetAssignmentsList = {
    pollRate: PollRate;
    functionSetAssignments: FunctionSetAssignments[];
} & SubscribableList;

export function parseFunctionSetAssignmentsListXml(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xml: any,
): FunctionSetAssignmentsList {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const subscribableList = parseSubscribableListXmlObject(
        xml['FunctionSetAssignmentsList'],
    );
    const pollRate = parsePollRateXmlObject(xml['FunctionSetAssignmentsList']);
    const functionSetAssignmentsArray = assertArray(
        xml['FunctionSetAssignmentsList']['FunctionSetAssignments'],
    );
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

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
