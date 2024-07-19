import { it, expect } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from './mocks';
import {
    parseMirrorUsagePointXmlObject,
    MirrorUsagePointStatus,
    generateMirrorUsagePointResponse,
} from './mirrorUsagePoint';
import { RoleFlagsType } from './roleFlagsType';
import { ServiceKind } from './serviceKind';
import { objectToXml } from './builder';

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
    expect(mirrorUsagePoint.roleFlags).toEqual(
        RoleFlagsType.isDER | RoleFlagsType.isMirror | RoleFlagsType.isSubmeter,
    );
    expect(mirrorUsagePoint.serviceCategoryKind).toEqual(
        ServiceKind.Electricity,
    );
    expect(mirrorUsagePoint.status).toEqual(MirrorUsagePointStatus.On);
    expect(mirrorUsagePoint.deviceLFDI).toEqual(
        '4075DE6031E562ACF4D9EAA765A5B2ED00057269',
    );
});

it('should generate MirrorUsagePoint XML', () => {
    const response = generateMirrorUsagePointResponse({
        mRID: '4075DE6031E562ACF4D9EA0B00057269',
        description: 'Site Measurement',
        roleFlags:
            RoleFlagsType.isPremisesAggregationPoint | RoleFlagsType.isMirror,
        serviceCategoryKind: ServiceKind.Electricity,
        status: MirrorUsagePointStatus.On,
        deviceLFDI: '4075DE6031E562ACF4D9EAA765A5B2ED00057269',
    });

    const xml = objectToXml(response);

    expect(xml).toBe(`<?xml version="1.0"?>
<MirrorUsagePoint xmlns="urn:ieee:std:2030.5:ns">
    <mRID>4075DE6031E562ACF4D9EA0B00057269</mRID>
    <description>Site Measurement</description>
    <roleFlags>03</roleFlags>
    <serviceCategoryKind>0</serviceCategoryKind>
    <status>1</status>
    <deviceLFDI>4075DE6031E562ACF4D9EAA765A5B2ED00057269</deviceLFDI>
</MirrorUsagePoint>`);
});
