import { it, expect } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from '../helpers/mocks.js';
import { parseMirrorUsagePointListXml } from './mirrorUsagePointList.js';

it('should parse end device list XML', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(getMockFile('getMup.xml'));

    const mirrorUsagePointList = parseMirrorUsagePointListXml(xml);

    expect(mirrorUsagePointList.all).toBe(2);
    expect(mirrorUsagePointList.mirrorUsagePoints.length).toBe(2);
    expect(mirrorUsagePointList.mirrorUsagePoints[0]?.mRID).toBe(
        '4075DE6031E562ACF4D9EA4900057269',
    );
});
