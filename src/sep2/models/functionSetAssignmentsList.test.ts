import { it, expect } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from '../helpers/mocks';
import { parseFunctionSetAssignmentsListXml } from './functionSetAssignmentsList';

it('should parse FunctionSetAssignmentsList XML', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(
        getMockFile('getEdev__EQLDEV3_fsa.xml'),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access

    const functionSetAssignmentsList = parseFunctionSetAssignmentsListXml(xml);

    expect(functionSetAssignmentsList.all).toBe(2);
    expect(functionSetAssignmentsList.functionSetAssignments.length).toBe(2);
});
