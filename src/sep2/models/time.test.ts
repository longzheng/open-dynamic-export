import { it, expect } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from '../helpers/mocks.js';
import { parseTimeXml } from './time.js';
import { TimeQuality } from './timeQuality.js';

it('should parse time XML', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(getMockFile('getTm.xml'));

    const time = parseTimeXml(xml);

    expect(time.currentTime.toJSON()).toBe('2023-04-26T02:10:24.000Z');
    expect(time.dstEndTime.toJSON()).toBe('2023-11-05T09:00:00.000Z');
    expect(time.dstOffset).toBe(3600);
    expect(time.dstStartTime.toJSON()).toBe('2023-03-12T10:00:00.000Z');
    expect(time.localTime?.toJSON()).toBe('2023-04-25T20:10:24.000Z');
    expect(time.quality).toBe(TimeQuality.Level4);
    expect(time.tzOffset).toBe(-25200);
});
