import { safeParseIntString } from '../../helpers/number.js';
import { assertString } from '../helpers/assert.js';

// The active (real) power P (in W) is the product of root-mean-square (RMS) voltage, RMS current, and cos(theta) where theta is the phase angle of current relative to voltage. It is the primary measure of the rate of flow of energy.
export type ActivePower = {
    value: number;
    // power of ten multiplier
    multiplier: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseActivePowerXmlObject(xmlObject: any): ActivePower {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const value = safeParseIntString(assertString(xmlObject['value'][0]));
    const multiplier = safeParseIntString(
        assertString(xmlObject['multiplier'][0]),
    );
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
        value,
        multiplier,
    };
}
