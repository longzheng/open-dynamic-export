import { it, expect, describe } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from '../helpers/mocks';
import {
    parseMirrorUsagePointXmlObject,
    generateMirrorUsagePointResponse,
} from './mirrorUsagePoint';
import { RoleFlagsType } from './roleFlagsType';
import { ServiceKind } from './serviceKind';
import { objectToXml } from '../helpers/xml';
import { UsagePointBaseStatus } from './usagePointBase';

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
    expect(mirrorUsagePoint.status).toEqual(UsagePointBaseStatus.On);
    expect(mirrorUsagePoint.deviceLFDI).toEqual(
        '4075DE6031E562ACF4D9EAA765A5B2ED00057269',
    );
});

describe('generateMirrorUsagePointResponse', () => {
    it('should generate MirrorUsagePoint XML for site', () => {
        const response = generateMirrorUsagePointResponse({
            mRID: '01E0F2357FF85E4B7EE6C60300057269',
            description: 'Site Measurement',
            roleFlags:
                RoleFlagsType.isPremisesAggregationPoint |
                RoleFlagsType.isMirror,
            serviceCategoryKind: ServiceKind.Electricity,
            status: UsagePointBaseStatus.On,
            deviceLFDI: '4075DE6031E562ACF4D9EAA765A5B2ED00057269',
        });

        const xml = objectToXml(response);

        expect(xml).toBe(`<?xml version="1.0"?>
<MirrorUsagePoint xmlns="urn:ieee:std:2030.5:ns">
    <mRID>01E0F2357FF85E4B7EE6C60300057269</mRID>
    <description>Site Measurement</description>
    <roleFlags>03</roleFlags>
    <serviceCategoryKind>0</serviceCategoryKind>
    <status>1</status>
    <deviceLFDI>4075DE6031E562ACF4D9EAA765A5B2ED00057269</deviceLFDI>
</MirrorUsagePoint>`);
    });

    it('should generate MirrorUsagePoint XML for DER', () => {
        const response = generateMirrorUsagePointResponse({
            mRID: '01E0F2357FF85E4B7EE6C64900057269',
            description: 'DER Measurement',
            roleFlags:
                RoleFlagsType.isDER |
                RoleFlagsType.isMirror |
                RoleFlagsType.isSubmeter,
            serviceCategoryKind: ServiceKind.Electricity,
            status: UsagePointBaseStatus.On,
            deviceLFDI: '4075DE6031E562ACF4D9EAA765A5B2ED00057269',
        });

        const xml = objectToXml(response);

        expect(xml).toBe(`<?xml version="1.0"?>
<MirrorUsagePoint xmlns="urn:ieee:std:2030.5:ns">
    <mRID>01E0F2357FF85E4B7EE6C64900057269</mRID>
    <description>DER Measurement</description>
    <roleFlags>49</roleFlags>
    <serviceCategoryKind>0</serviceCategoryKind>
    <status>1</status>
    <deviceLFDI>4075DE6031E562ACF4D9EAA765A5B2ED00057269</deviceLFDI>
</MirrorUsagePoint>`);
    });
});
