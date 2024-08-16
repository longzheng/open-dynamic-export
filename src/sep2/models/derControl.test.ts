import { it, expect } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from '../helpers/mocks';
import { parseDERControlXmlObject } from './derControl';
import { CurrentStatus } from './eventStatus';

it('should parse DER Control XML', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(
        getMockFile('getDerp_TESTPROG3_derc.xml'),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const derControlXmlObject =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        xml['DERControlList']['DERControl'][0];

    const derControl = parseDERControlXmlObject(derControlXmlObject);

    expect(derControl.replyToHref).toBe('/api/v2/rsps/res-ms/rsp');
    expect(derControl.mRID).toBe('DC1B27AC943B44AC87DAF7E162B6F6D4');
    expect(derControl.version).toBe(0);
    expect(derControl.creationTime.getTime()).toBe(1682511010000);
    expect(derControl.eventStatus.currentStatus).toBe(CurrentStatus.Scheduled);
    expect(derControl.eventStatus.dateTime.getTime()).toBe(1682511010000);
    expect(derControl.eventStatus.potentiallySuperseded).toBe(false);
    expect(derControl.eventStatus.potentiallySupersededTime?.getTime()).toBe(
        1682511010000,
    );
    expect(derControl.randomizeStart).toBe(undefined);
    expect(derControl.randomizeDuration).toBe(undefined);
    expect(derControl.interval.start.getTime()).toBe(1682475300000);
    expect(derControl.interval.duration).toBe(300);
    expect(derControl.derControlBase.opModExpLimW?.value).toBe(2512);
});

it('should parse DER Control XML with randomization', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xml = await parseStringPromise(
        `<DERControl subscribable="0" replyTo="/api/v2/rsps/res-ms/rsp" responseRequired="03" href="/api/v2/derp/TESTPRG3/derc/ABCDEF0123456789">
    <mRID>ABCDEF0123456789</mRID>
    <description>Example DERControl 1</description>
    <creationTime>1639545523</creationTime>
    <EventStatus>
        <currentStatus>1</currentStatus>
        <dateTime>1639545638</dateTime>
        <potentiallySuperseded>false</potentiallySuperseded>
    </EventStatus>
    <interval>
        <start>1605621600</start>
        <duration>86400</duration>
    </interval>
    <randomizeStart>10</randomizeStart>
    <randomizeDuration>-10</randomizeDuration>
    <DERControlBase>
        <ns2:opModImpLimW>
            <multiplier>3</multiplier>
            <value>12</value>
        </ns2:opModImpLimW>
        <ns2:opModExpLimW>
            <multiplier>4</multiplier>
            <value>1</value>
        </ns2:opModExpLimW>
    </DERControlBase>
</DERControl>`,
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const derControlXmlObject =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        xml['DERControl'];

    const derControl = parseDERControlXmlObject(derControlXmlObject);

    expect(derControl.replyToHref).toBe('/api/v2/rsps/res-ms/rsp');
    expect(derControl.mRID).toBe('ABCDEF0123456789');
    expect(derControl.version).toBe(undefined);
    expect(derControl.creationTime.getTime()).toBe(1639545523000);
    expect(derControl.eventStatus.currentStatus).toBe(CurrentStatus.Active);
    expect(derControl.eventStatus.dateTime.getTime()).toBe(1639545638000);
    expect(derControl.eventStatus.potentiallySuperseded).toBe(false);
    expect(derControl.eventStatus.potentiallySupersededTime?.getTime()).toBe(
        undefined,
    );
    expect(derControl.randomizeStart).toBe(10);
    expect(derControl.randomizeDuration).toBe(-10);
    expect(derControl.interval.start.getTime()).toBe(1605621600000);
    expect(derControl.interval.duration).toBe(86400);
    expect(derControl.derControlBase.opModExpLimW?.value).toBe(1);
});
