// The apparent power S (in VA) is the product of root mean square (RMS) voltage and RMS current.
export type ApparentPower = {
    // Value in volt-amperes (uom 61)
    value: number;
    // Specifies exponent of uom.
    // power of ten multiplier
    multiplier: number;
};
