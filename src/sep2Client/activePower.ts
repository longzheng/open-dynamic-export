import { safeParseIntString } from '../number';
import { assertString } from './assert';

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

// helper function to convert ActivePower to watts
export function activePowerToWatts(activePower: ActivePower): number {
    return activePower.value * 10 ** activePower.multiplier;
}

export function generateActivePowerResponse({
    value,
    multiplier,
}: ActivePower) {
    return {
        multiplier,
        value,
    };
}
