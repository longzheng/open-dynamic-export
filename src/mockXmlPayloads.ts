const mockDeviceCapabilitiesXml = `
<sep2:DeviceCapability xmlns:sep2="urn:ieee:std:2030.5:ns">
    <sep2:TimeLink href="/time"/>
    <sep2:EndDeviceListLink href="/edev"/>
    <sep2:MirrorUsagePointListLink href="/mup"/>
</sep2:DeviceCapability>
`;

const mockTimeLinkXml = `
<sep2:Time xmlns:sep2="urn:ieee:std:2030.5:ns">
    <sep2:currentTime>1659656880</sep2:currentTime>
</sep2:Time>
`;

const mockDerControlListXml = `
<sep2:DERControlList xmlns:sep2="urn:ieee:std:2030.5:ns" xmlns:csipaus="https://csipaus.org/ns">
    <sep2:DERControl>
        <sep2:mRID>ABCDEF0123456789</sep2:mRID>
        <sep2:description>Example DERControl 1</sep2:description>
        <sep2:creationTime>1639545523</sep2:creationTime>
        <sep2:EventStatus>
            <sep2:currentStatus>1</sep2:currentStatus>
            <sep2:dateTime>1639545638</sep2:dateTime>
            <sep2:reason>event active</sep2:reason>
        </sep2:EventStatus>
        <sep2:interval>
            <sep2:start>1605621600</sep2:start>
            <sep2:duration>86400</sep2:duration>
        </sep2:interval>
        <sep2:randomizeStart>10</sep2:randomizeStart>
        <sep2:DERControlBase>
            <csipaus:opModImLimW>20000</csipaus:opModImLimW>
            <csipaus:opModExLimW>5000</csipaus:opModExLimW>
        </sep2:DERControlBase>
    </sep2:DERControl>
</sep2:DERControlList>
`;

export { mockDeviceCapabilitiesXml, mockTimeLinkXml, mockDerControlListXml };
