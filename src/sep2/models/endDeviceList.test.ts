import { it, expect } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from '../helpers/mocks';
import { parseEndDeviceListXml } from './endDeviceList';

it('should parse end device list XML', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(getMockFile('getEdev.xml'));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access

    const endDeviceList = parseEndDeviceListXml(xml);

    expect(endDeviceList.all).toBe(5);
    expect(endDeviceList.subscribable).toBe(true);
    expect(endDeviceList.endDevices.length).toBe(3);
    expect(endDeviceList.endDevices[0]?.lFDI).toBe(
        '4075DE6031E562ACF4D9EAA765A5B2ED00057269',
    );
});
