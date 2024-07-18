import { it, expect } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from './mocks';
import {
    parseMirrorUsagePointXmlObject,
    MirrorUsagePointRoleFlag,
    MirrorUsagePointStatus,
} from './mirrorUsagePoint';

it('should parse end device DER with XML', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(getMockFile('getMup.xml'));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const mirrorUsagePointXmlObject =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        xml['MirrorUsagePointList']['MirrorUsagePoint'][0];

    const mirrorUsagePoint = parseMirrorUsagePointXmlObject(
        mirrorUsagePointXmlObject,
    );

    expect(mirrorUsagePoint.mRID).toEqual('4075DE6031E562ACF4D9EA4900057269');
    expect(mirrorUsagePoint.description).toEqual('Device Measurement');
    expect(mirrorUsagePoint.roleFlags).toEqual(MirrorUsagePointRoleFlag.Der);
    expect(mirrorUsagePoint.serviceCategoryKind).toEqual('0');
    expect(mirrorUsagePoint.status).toEqual(MirrorUsagePointStatus.On);
    expect(mirrorUsagePoint.deviceLFDI).toEqual(
        '4075DE6031E562ACF4D9EAA765A5B2ED00057269',
    );
});
