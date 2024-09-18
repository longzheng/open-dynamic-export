import { safeParseIntString } from '../../helpers/number.js';
import { assertString } from '../helpers/assert.js';
import { stringToBoolean } from '../helpers/boolean.js';
import { stripNamespacePrefix } from '../helpers/stripNamespacePrefix.js';
import { parseActivePowerXmlObject, type ActivePower } from './activePower.js';

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
    // Requested ramp time, in hundredths of a second, for the device to transition from the current DERControl mode setting(s) to the new mode setting(s). If absent, use default ramp rate (setGradW). Resolution is 1/100 sec.
    rampTms?: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseDERControlBaseXmlObject(xmlObject: any): DERControlBase {
    // the server might send CSIP-AUS namespace with a different prefix
    // strip the prefix from all the property keys
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xmlObjectWithoutPrefix = stripNamespacePrefix(xmlObject);

    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const opModImpLimW = parseLimitWattsXmlObjectOptional(
        xmlObjectWithoutPrefix['opModImpLimW'],
    );
    const opModExpLimW = parseLimitWattsXmlObjectOptional(
        xmlObjectWithoutPrefix['opModExpLimW'],
    );
    const opModGenLimW = parseLimitWattsXmlObjectOptional(
        xmlObjectWithoutPrefix['opModGenLimW'],
    );
    const opModLoadLimW = parseLimitWattsXmlObjectOptional(
        xmlObjectWithoutPrefix['opModLoadLimW'],
    );
    const opModEnergize = xmlObject['opModEnergize']
        ? stringToBoolean(assertString(xmlObject['opModEnergize'][0]))
        : undefined;
    const opModConnect = xmlObject['opModConnect']
        ? stringToBoolean(assertString(xmlObject['opModConnect'][0]))
        : undefined;
    const rampTms = xmlObject['rampTms']
        ? safeParseIntString(assertString(xmlObject['rampTms'][0]))
        : undefined;
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        opModImpLimW,
        opModExpLimW,
        opModGenLimW,
        opModLoadLimW,
        opModEnergize,
        opModConnect,
        rampTms,
    };
}

function parseLimitWattsXmlObjectOptional(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): ActivePower | undefined {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return xmlObject ? parseActivePowerXmlObject(xmlObject[0]) : undefined;
}
