import { assertString } from '../helpers/assert';
import { stringToBoolean } from '../helpers/boolean';
import { parseActivePowerXmlObject, type ActivePower } from './activePower';

export type DERControlBase = {
    // site import limit
    opModImpLimW?: ActivePower;
    // site export limit
    opModExpLimW?: ActivePower;
    // site generation limit
    opModGenLimW?: ActivePower;
    // site load limit
    opModLoadLimW?: ActivePower;
    // energize
    opModEnergize?: boolean;
    // connect
    opModConnect?: boolean;
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
    const opModEnergize = xmlObject['opModEnergize']
        ? stringToBoolean(assertString(xmlObject['opModEnergize'][0]))
        : undefined;
    const opModConnect = xmlObject['opModConnect']
        ? stringToBoolean(assertString(xmlObject['opModConnect'][0]))
        : undefined;
    /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

    return {
        opModImpLimW,
        opModExpLimW,
        opModGenLimW,
        opModLoadLimW,
        opModEnergize,
        opModConnect,
    };
}

function parseLimitWattsXmlObjectOptional(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): ActivePower | undefined {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return xmlObject ? parseActivePowerXmlObject(xmlObject[0]) : undefined;
}
