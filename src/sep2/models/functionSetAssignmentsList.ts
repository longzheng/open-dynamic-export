import { assertArray } from '../helpers/assert';
import {
    parseFunctionSetAssignmentsXmlObject,
    type FunctionSetAssignments,
} from './functionSetAssignments';
import type { PollRate } from './pollRate';
import { parsePollRateXmlObject } from './pollRate';
import {
    parseSubscribableListXmlObject,
    type SubscribableList,
} from './subscribableList';

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
