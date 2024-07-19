import { assertString } from './assert';
import { stringToBoolean } from './boolean';
import { parseLimitWattsXmlObject, type LimitWatts } from './limitWatts';

export type DERControlBase = {
    // site import limit
    opModImpLimW?: LimitWatts;
    // site export limit
    opModExpLimW?: LimitWatts;
    // site generation limit
    opModGenLimW?: LimitWatts;
    // site load limit
    opModLoadLimW?: LimitWatts;
    // energize
    opModEnergize?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseDERControlBaseXmlObject(xmlObject: any): DERControlBase {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
    const opModImpLimW = parseLimitWattsXmlObjectOptional(
        xmlObject['ns2:opModImpLimW'],
    );
    const opModExpLimW = parseLimitWattsXmlObjectOptional(
        xmlObject['ns2:opModExpLimW'],
    );
    const opModGenLimW = parseLimitWattsXmlObjectOptional(
        xmlObject['ns2:opModGenLimW'],
    );
    const opModLoadLimW = parseLimitWattsXmlObjectOptional(
        xmlObject['ns2:opModLoadLimW'],
    );
    const opModEnergizeXmlObject = xmlObject['opModEnergize'];
    /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

    const opModEnergize = opModEnergizeXmlObject
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          stringToBoolean(assertString(opModEnergizeXmlObject[0]))
        : undefined;

    return {
        opModImpLimW,
        opModExpLimW,
        opModGenLimW,
        opModLoadLimW,
        opModEnergize,
    };
}

function parseLimitWattsXmlObjectOptional(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): LimitWatts | undefined {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return xmlObject ? parseLimitWattsXmlObject(xmlObject[0]) : undefined;
}
