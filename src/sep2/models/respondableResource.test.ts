import { it, expect } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from '../helpers/mocks';
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

    expect(respondableResource.href).toEqual(
        '/api/v2/derp/TESTPRG3/derc/DC1B27AC943B44AC87DAF7E162B6F6D4',
    );
    expect(respondableResource.replyToHref).toEqual('/api/v2/rsps/res-ms/rsp');
    expect(respondableResource.responseRequired).toEqual(
        ResponseRequiredType.MessageReceived |
            ResponseRequiredType.SpecificResponse,
    );
});
