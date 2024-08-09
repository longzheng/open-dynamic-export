import { it, expect } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from '../helpers/mocks';
import { parseFunctionSetAssignmentsXmlObject } from './functionSetAssignments';

it('should parse FunctionSetAssignmentsList XML', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(
        getMockFile('getEdev__EQLDEV3_fsa.xml'),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const functionSetAssignmentsXmlObject =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        xml['FunctionSetAssignmentsList']['FunctionSetAssignments'][0];

    const functionSetAssignments = parseFunctionSetAssignmentsXmlObject(
        functionSetAssignmentsXmlObject,
    );

    expect(functionSetAssignments.href).toBe('/api/v2/edev/_EQLDEV3/fsa/2');
    expect(functionSetAssignments.derProgramListLink.href).toBe(
        '/api/v2/edev/_EQLDEV3/fsa/2/derp',
    );
    expect(functionSetAssignments.responseSetListLink.href).toBe(
        '/api/v2/rsps',
    );
    expect(functionSetAssignments.timeLink.href).toBe('/api/v2/tm');
    expect(functionSetAssignments.mRID).toBe(
        'DE045D141A8B335F96AFDE5AFECDBA09',
    );
    expect(functionSetAssignments.description).toBe('FSA 2');
    expect(functionSetAssignments.version).toBe(1);
});
