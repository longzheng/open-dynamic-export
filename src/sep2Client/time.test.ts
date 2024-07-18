import { it, expect } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from './mocks';
import { parseTimeXml } from './time';

it('should parse time XML', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(getMockFile('getTm.xml'));

    const time = parseTimeXml(xml);

    expect(time.currentTime.toJSON()).toBe('2023-04-26T02:10:24.000Z');
});
