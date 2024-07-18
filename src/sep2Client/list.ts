import { safeParseIntString } from '../number';
import { assertString } from './assert';

export type List = {
    all: number;
    results: number;
};

export function parseListXmlObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xmlObject: any,
): List {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
    const all = safeParseIntString(assertString(xmlObject['$']['all']));
    const results = safeParseIntString(assertString(xmlObject['$']['results']));
    /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

    return {
        all,
        results,
    };
}
