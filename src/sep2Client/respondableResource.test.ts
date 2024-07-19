import { it, expect } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from './mocks';
import { parseRespondableResourceXmlObject } from './respondableResource';
import { ResponseRequiredType } from './responseRequired';

it('should parse respondable resource XML object', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(
        getMockFile('getDerp_TESTPROG3_derc.xml'),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const respondableResourceXmlObject =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        xml['DERControlList']['DERControl'][0];

    const respondableResource = parseRespondableResourceXmlObject(
        respondableResourceXmlObject,
    );

    expect(respondableResource.replyToHref).toEqual('/api/v2/rsps/res-ms/rsp');
    expect(respondableResource.responseRequired).toEqual(
        ResponseRequiredType.MessageReceived |
            ResponseRequiredType.SpecificResponse,
    );
});