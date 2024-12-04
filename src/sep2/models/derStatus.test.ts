import { it, expect, describe } from 'vitest';
import { objectToXml } from '../helpers/xml.js';
import { generateDerStatusResponse } from './derStatus.js';
import { ConnectStatusValue } from './connectStatus.js';
import { OperationalModeStatusValue } from './operationModeStatus.js';
import { StorageModeStatusValue } from './storageModeStatus.js';

describe('generateDerStatusResponse', () => {
    it('should generate DERStatus XML', () => {
        const response = generateDerStatusResponse({
            readingTime: new Date(1682475028 * 1000),
            operationalModeStatus: {
                dateTime: new Date(1682475028 * 1000),
                value: OperationalModeStatusValue.OperationalMode,
            },
            genConnectStatus: {
                dateTime: new Date(1682475028 * 1000),
                value: ConnectStatusValue.Connected,
            },
        });

        const xml = objectToXml(response);

        expect(xml).toBe(`<?xml version="1.0"?>
<DERStatus xmlns="urn:ieee:std:2030.5:ns">
    <readingTime>1682475028</readingTime>
    <operationalModeStatus>
        <dateTime>1682475028</dateTime>
        <value>2</value>
    </operationalModeStatus>
    <genConnectStatus>
        <dateTime>1682475028</dateTime>
        <value>01</value>
    </genConnectStatus>
</DERStatus>`);
    });

    it('should generate optional storage XML', () => {
        const response = generateDerStatusResponse({
            readingTime: new Date(1682475028 * 1000),
            operationalModeStatus: {
                dateTime: new Date(1682475028 * 1000),
                value: OperationalModeStatusValue.OperationalMode,
            },
            genConnectStatus: {
                dateTime: new Date(1682475028 * 1000),
                value: ConnectStatusValue.Connected,
            },
            storConnectStatus: {
                dateTime: new Date(1682475028 * 1000),
                value: ConnectStatusValue.Connected,
            },
            stateOfChargeStatus: {
                dateTime: new Date(1682475028 * 1000),
                value: 50,
            },
            storageModeStatus: {
                dateTime: new Date(1682475028 * 1000),
                value: StorageModeStatusValue.StorageCharging,
            },
        });

        const xml = objectToXml(response);

        expect(xml).toBe(`<?xml version="1.0"?>
<DERStatus xmlns="urn:ieee:std:2030.5:ns">
    <readingTime>1682475028</readingTime>
    <operationalModeStatus>
        <dateTime>1682475028</dateTime>
        <value>2</value>
    </operationalModeStatus>
    <genConnectStatus>
        <dateTime>1682475028</dateTime>
        <value>01</value>
    </genConnectStatus>
    <storConnectStatus>
        <dateTime>1682475028</dateTime>
        <value>01</value>
    </storConnectStatus>
    <stateOfChargeStatus>
        <dateTime>1682475028</dateTime>
        <value>50</value>
    </stateOfChargeStatus>
    <storageModeStatus>
        <dateTime>1682475028</dateTime>
        <value>2</value>
    </storageModeStatus>
</DERStatus>`);
    });
});
