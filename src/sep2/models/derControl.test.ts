import { it, expect } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from '../helpers/mocks';
import {
    DERControlEventStatusCurrentStatus,
    parseDERControlXmlObject,
} from './derControl';

it('should parse Default DER Control XML', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(
        getMockFile('getDerp_TESTPROG3_derc.xml'),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const derControlXmlObject =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        xml['DERControlList']['DERControl'][0];

    const derControl = parseDERControlXmlObject(derControlXmlObject);

    expect(derControl.respondableResource.replyToHref).toBe(
        '/api/v2/rsps/res-ms/rsp',
    );
    expect(derControl.mRID).toBe('DC1B27AC943B44AC87DAF7E162B6F6D4');
    expect(derControl.version).toBe(0);
    expect(derControl.creationTime.getTime()).toBe(1682511010000);
    expect(derControl.eventStatus.currentStatus).toBe(
        DERControlEventStatusCurrentStatus.Scheduled,
    );
    expect(derControl.eventStatus.dateTime.getTime()).toBe(1682511010000);
    expect(derControl.eventStatus.potentiallySuperseded).toBe(false);
    expect(derControl.eventStatus.potentiallySupersededTime.getTime()).toBe(
        1682511010000,
    );
    expect(derControl.interval.start.getTime()).toBe(1682475300000);
    expect(derControl.interval.durationSeconds).toBe(300);
    expect(derControl.interval.end.getTime()).toBe(1682475300000 + 300 * 1000);
    expect(derControl.derControlBase.opModExpLimW?.value).toBe(2512);
});
