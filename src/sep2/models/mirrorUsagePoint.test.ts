import { it, expect, describe } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from '../helpers/mocks.js';
import {
    parseMirrorUsagePointXmlObject,
    generateMirrorUsagePointResponse,
} from './mirrorUsagePoint.js';
import { RoleFlagsType } from './roleFlagsType.js';
import { ServiceKind } from './serviceKind.js';
import { objectToXml } from '../helpers/xml.js';
import { QualityFlags } from './qualityFlags.js';
import { CommodityType } from './commodityType.js';
import { KindType } from './kindType.js';
import { DataQualifierType } from './dataQualifierType.js';
import { FlowDirectionType } from './flowDirectionType.js';
import { PhaseCode } from './phaseCode.js';
import { UomType } from './uomType.js';
import { UsagePointBaseStatus } from './usagePointBaseStatus.js';
import { validateXml } from '../helpers/xsdValidator.js';

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

    it('should generate MirrorUsagePoint XML for DER with MirrorMeterReading', () => {
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
            mirrorMeterReading: [
                {
                    mRID: 'AA00007301',
                    description: 'Avg W Reading - Phase A (Site)',
                    lastUpdateTime: new Date(1659656880 * 1000),
                    nextUpdateTime: new Date(1659657180 * 1000),
                    version: 0,
                    Reading: {
                        qualityFlags: QualityFlags.Valid,
                        value: 1500,
                    },
                    ReadingType: {
                        commodity:
                            CommodityType.ElectricitySecondaryMeteredValue,
                        kind: KindType.Power,
                        dataQualifier: DataQualifierType.Average,
                        flowDirection: FlowDirectionType.Reverse,
                        phase: PhaseCode.PhaseA,
                        powerOfTenMultiplier: 0,
                        intervalLength: 300,
                        uom: UomType.W,
                    },
                },
                {
                    mRID: 'AA00007302',
                    description: 'Average W Reading - Phase B (Site)',
                    lastUpdateTime: new Date(1659656880 * 1000),
                    nextUpdateTime: new Date(1659657180 * 1000),
                    version: 0,
                    Reading: {
                        qualityFlags: QualityFlags.Valid,
                        value: 1500,
                    },
                    ReadingType: {
                        commodity:
                            CommodityType.ElectricitySecondaryMeteredValue,
                        kind: KindType.Power,
                        dataQualifier: DataQualifierType.Average,
                        flowDirection: FlowDirectionType.Reverse,
                        phase: PhaseCode.PhaseB,
                        powerOfTenMultiplier: 0,
                        intervalLength: 300,
                        uom: UomType.W,
                    },
                },
            ],
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
    <MirrorMeterReading>
        <mRID>AA00007301</mRID>
        <description>Avg W Reading - Phase A (Site)</description>
        <version>0</version>
        <lastUpdateTime>1659656880</lastUpdateTime>
        <nextUpdateTime>1659657180</nextUpdateTime>
        <Reading>
            <qualityFlags>0001</qualityFlags>
            <value>1500</value>
        </Reading>
        <ReadingType>
            <commodity>1</commodity>
            <dataQualifier>2</dataQualifier>
            <flowDirection>19</flowDirection>
            <intervalLength>300</intervalLength>
            <kind>37</kind>
            <phase>128</phase>
            <powerOfTenMultiplier>0</powerOfTenMultiplier>
            <uom>38</uom>
        </ReadingType>
    </MirrorMeterReading>
    <MirrorMeterReading>
        <mRID>AA00007302</mRID>
        <description>Average W Reading - Phase B (Site)</description>
        <version>0</version>
        <lastUpdateTime>1659656880</lastUpdateTime>
        <nextUpdateTime>1659657180</nextUpdateTime>
        <Reading>
            <qualityFlags>0001</qualityFlags>
            <value>1500</value>
        </Reading>
        <ReadingType>
            <commodity>1</commodity>
            <dataQualifier>2</dataQualifier>
            <flowDirection>19</flowDirection>
            <intervalLength>300</intervalLength>
            <kind>37</kind>
            <phase>64</phase>
            <powerOfTenMultiplier>0</powerOfTenMultiplier>
            <uom>38</uom>
        </ReadingType>
    </MirrorMeterReading>
</MirrorUsagePoint>`);
    });

    it('should generate XSD-valid MirrorUsagePoint XML', () => {
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
        const validation = validateXml(xml);

        expect(validation.valid).toBe(true);
    });

    it('should generate XSD-valid MirrorUsagePoint XML with MirrorMeterReading', () => {
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
            mirrorMeterReading: [
                {
                    mRID: 'AA00007301',
                    description: 'Avg W Reading - Phase A (Site)',
                    lastUpdateTime: new Date(1659656880 * 1000),
                    nextUpdateTime: new Date(1659657180 * 1000),
                    version: 0,
                    Reading: {
                        qualityFlags: QualityFlags.Valid,
                        value: 1500,
                    },
                    ReadingType: {
                        commodity:
                            CommodityType.ElectricitySecondaryMeteredValue,
                        kind: KindType.Power,
                        dataQualifier: DataQualifierType.Average,
                        flowDirection: FlowDirectionType.Reverse,
                        phase: PhaseCode.PhaseA,
                        powerOfTenMultiplier: 0,
                        intervalLength: 300,
                        uom: UomType.W,
                    },
                },
            ],
        });

        const xml = objectToXml(response);
        const validation = validateXml(xml);

        expect(validation.valid).toBe(true);
    });
});
