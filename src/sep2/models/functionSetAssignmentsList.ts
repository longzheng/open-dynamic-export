import { assertArray } from '../helpers/assert';
import {
    parseFunctionSetAssignmentsXmlObject,
    type FunctionSetAssignments,
} from './functionSetAssignments';
import { parseListXmlObject, type List } from './list';

export type FunctionSetAssignmentsList = {
    list: List;
    functionSetAssignments: FunctionSetAssignments[];
};

export function parseFunctionSetAssignmentsListXml(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xml: any,
): FunctionSetAssignmentsList {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const list = parseListXmlObject(xml['FunctionSetAssignmentsList']);
    const functionSetAssignmentsArray = assertArray(
        xml['FunctionSetAssignmentsList']['FunctionSetAssignments'],
    );
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

    const functionSetAssignments = functionSetAssignmentsArray.map(
        (assignmentXmlObject) =>
            parseFunctionSetAssignmentsXmlObject(assignmentXmlObject),
    );

    return {
        list,
        functionSetAssignments,
    };
}
