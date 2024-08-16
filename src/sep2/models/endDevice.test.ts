import { it, expect } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from '../helpers/mocks';
import type { EndDevice } from './endDevice';
import { parseEndDeviceXml } from './endDevice';

it('should parse end device DER with XML', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(getMockFile('getEdev__EQLDEV3.xml'));

    const endDevice = parseEndDeviceXml(xml);

    expect(endDevice).toStrictEqual({
        href: '/api/v2/edev/_EQLDEV3',
        subscribable: false,
        lFDI: '4075DE6031E562ACF4D9EAA765A5B2ED00057269',
        logEventListLink: { href: '/api/v2/edev/_EQLDEV3/lel', all: 0 },
        sFDI: '173034634270',
        changedTime: new Date(1682464970000),
        enabled: true,
        functionSetAssignmentsListLink: {
            href: '/api/v2/edev/_EQLDEV3/fsa',
            all: 2,
        },
        registrationLink: { href: '/api/v2/edev/_EQLDEV3/rg' },
        derListLink: { href: '/api/v2/edev/_EQLDEV3/der', all: 1 },
        subscriptionListLink: undefined,
    } satisfies EndDevice);
});

it('should parse end device aggregator with XML', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(getMockFile('getEdev_E-AGGREQL.xml'));

    const endDevice = parseEndDeviceXml(xml);

    expect(endDevice).toStrictEqual({
        href: '/api/v2/edev/E-AGGREQL',
        subscribable: false,
        lFDI: 'B1857F74B5DA25E82E78BE34877221CB89D55F45',
        logEventListLink: { href: '/api/v2/edev/E-AGGREQL/lel', all: 0 },
        sFDI: '476530583793',
        changedTime: new Date(1682464920000),
        registrationLink: { href: '/api/v2/edev/E-AGGREQL/rg' },
        subscriptionListLink: { href: '/api/v2/edev/E-AGGREQL/sub', all: 0 },
        derListLink: undefined,
        enabled: true,
        functionSetAssignmentsListLink: undefined,
    } satisfies EndDevice);
});
