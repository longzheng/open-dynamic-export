import { it, expect } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from '../helpers/mocks.js';
import { CurrentStatus, parseEventStatusXmlObject } from './eventStatus.js';

it('should parse event status XML', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(
        getMockFile('getDerp_TESTPROG3_derc.xml'),
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xmlObject =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        xml['DERControlList']['DERControl'][0]['EventStatus'][0];

    const eventStatus = parseEventStatusXmlObject(xmlObject);

    expect(eventStatus.currentStatus).toBe(CurrentStatus.Scheduled);
    expect(eventStatus.dateTime.getTime()).toBe(1682511010000);
    expect(eventStatus.potentiallySuperseded).toBe(false);
    expect(eventStatus.potentiallySupersededTime?.getTime()).toBe(
        1682511010000,
    );
    expect(eventStatus.reason).toBe('');
});
