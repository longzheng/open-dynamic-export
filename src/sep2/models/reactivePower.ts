// The reactive power Q (in var) is the product of root mean square (RMS) voltage, RMS current, and sin(theta) where theta is the phase angle of current relative to voltage.
export type ReactivePower = {
    // Value in volt-amperes reactive (var) (uom 63)
    value: number;
    // Specifies exponent of uom.
    // power of ten multiplier
    multiplier: number;
};

export function generateReactivePowerResponse({
    value,
    multiplier,
}: ReactivePower) {
    return {
        multiplier,
        value,
    };
}
