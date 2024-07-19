// Average electric potential difference between two points.
export type VoltageRMS = {
    // Value in volts RMS (uom 29)
    value: number;
    // Specifies exponent of uom.
    // power of ten multiplier
    multiplier: number;
};

export function generateVoltageRmsResponse({ value, multiplier }: VoltageRMS) {
    return {
        multiplier,
        value,
    };
}
