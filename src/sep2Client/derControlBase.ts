import { assertString } from './assert';
import { stringToBoolean } from './boolean';
import { parseLimitWattsXmlObject, type LimitWatts } from './limitWatts';

export type DERControlBase = {
    siteImportLimitWatts?: LimitWatts;
    siteExportLimitWatts?: LimitWatts;
    generationLimit?: LimitWatts;
    loadLimit?: LimitWatts;
    energize?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseDERControlBaseXmlObject(xmlObject: any): DERControlBase {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
    const siteImportLimitWatts = parseLimitWattsXmlObjectOptional(
        xmlObject['ns2:opModImpLimW'],
    );
    const siteExportLimitWatts = parseLimitWattsXmlObjectOptional(
        xmlObject['ns2:opModExpLimW'],
    );
    const generationLimit = parseLimitWattsXmlObjectOptional(
        xmlObject['ns2:opModGenLimW'],
    );
    const loadLimit = parseLimitWattsXmlObjectOptional(
        xmlObject['ns2:opModLoadLimW'],
    );
    const energizeXmlObject = xmlObject['opModEnergize'];
    /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

    const energize = energizeXmlObject
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          stringToBoolean(assertString(energizeXmlObject[0]))
        : undefined;

    return {
        siteImportLimitWatts,
        siteExportLimitWatts,
        generationLimit,
        loadLimit,
        energize,
    };
}

function parseLimitWattsXmlObjectOptional(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): LimitWatts | undefined {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return xmlObject ? parseLimitWattsXmlObject(xmlObject[0]) : undefined;
}
