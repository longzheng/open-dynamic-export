import { it, expect } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from '../helpers/mocks.js';
import { parseDerXmlObject } from './der.js';

it('should parse DER XML object', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(
        getMockFile('getEdev__EQLDEV3_der.xml'),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const derXmlObject =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        xml['DERList']['DER'][0];

    const der = parseDerXmlObject(derXmlObject);

    expect(der.subscribable).toBe(false);
    expect(der.derAvailabilityLink.href).toBe(
        '/api/v2/edev/_EQLDEV3/der/_EQLDEV3/dera',
    );
    expect(der.derCapabilityLink.href).toBe(
        '/api/v2/edev/_EQLDEV3/der/_EQLDEV3/dercap',
    );
    expect(der.derSettingsLink.href).toBe(
        '/api/v2/edev/_EQLDEV3/der/_EQLDEV3/derg',
    );
    expect(der.derStatusLink.href).toBe(
        '/api/v2/edev/_EQLDEV3/der/_EQLDEV3/ders',
    );
});
