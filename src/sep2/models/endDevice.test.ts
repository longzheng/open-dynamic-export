import { it, expect, describe } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from '../helpers/mocks.js';
import { type EndDevice } from './endDevice.js';
import { generateEndDeviceResponse, parseEndDeviceXml } from './endDevice.js';
import { objectToXml } from '../helpers/xml.js';

describe('parseEndDeviceXml', () => {
    it('should parse end device DER with XML', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const xml = await parseStringPromise(
            getMockFile('getEdev__EQLDEV3.xml'),
        );

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
            connectionPointLink: undefined,
        } satisfies EndDevice);
    });

    it('should parse end device aggregator with XML', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const xml = await parseStringPromise(
            getMockFile('getEdev_E-AGGREQL.xml'),
        );

        const endDevice = parseEndDeviceXml(xml);

        expect(endDevice).toStrictEqual({
            href: '/api/v2/edev/E-AGGREQL',
            subscribable: false,
            lFDI: 'B1857F74B5DA25E82E78BE34877221CB89D55F45',
            logEventListLink: { href: '/api/v2/edev/E-AGGREQL/lel', all: 0 },
            sFDI: '476530583793',
            changedTime: new Date(1682464920000),
            registrationLink: { href: '/api/v2/edev/E-AGGREQL/rg' },
            subscriptionListLink: {
                href: '/api/v2/edev/E-AGGREQL/sub',
                all: 0,
            },
            derListLink: undefined,
            enabled: true,
            functionSetAssignmentsListLink: undefined,
            connectionPointLink: undefined,
        } satisfies EndDevice);
    });

    it('should parse end device with csipaus:ConnectionPointLink', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const xml = await parseStringPromise(
            getMockFile('getEdev_csipaus_edev1.xml'),
        );

        const endDevice = parseEndDeviceXml(xml);

        expect(endDevice.lFDI).toStrictEqual(
            '12a4a4b406ad102e7421019135ffa2805235a21c',
        );
        expect(endDevice.connectionPointLink).toStrictEqual({
            href: '/edev/1/cp',
        });
    });
});

describe('generateEndDeviceResponse', () => {
    it('should generate EndDevice XML', () => {
        const response = generateEndDeviceResponse({
            lFDI: 'B1857F74B5DA25E82E78BE34877221CB89D55F45',
            sFDI: '476530583793',
            changedTime: new Date(1682464920000),
            enabled: true,
        });

        const xml = objectToXml(response);

        expect(xml).toBe(`<?xml version="1.0"?>
<EndDevice xmlns="urn:ieee:std:2030.5:ns">
    <sFDI>476530583793</sFDI>
    <lFDI>B1857F74B5DA25E82E78BE34877221CB89D55F45</lFDI>
    <enabled>1</enabled>
    <changedTime>1682464920</changedTime>
</EndDevice>`);
    });
});
