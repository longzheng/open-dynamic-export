import { it, expect } from 'vitest';
import { objectToXml } from './builder';
import { generateDerStatusResponse, OperationalModeStatus } from './derStatus';
import { ConnectStatus } from './connectStatus';

it('should generate DERStatus XML', () => {
    const response = generateDerStatusResponse({
        readingTime: new Date(1682475028 * 1000),
        operationalModeStatus: {
            dateTime: new Date(1682475028 * 1000),
            value: OperationalModeStatus.OperationalMode,
        },
        genConnectStatus: {
            dateTime: new Date(1682475028 * 1000),
            value: ConnectStatus.Connected,
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
        <value>1</value>
    </genConnectStatus>
</DERStatus>`);
});
