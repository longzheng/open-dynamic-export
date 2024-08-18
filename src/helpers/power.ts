import Decimal from 'decimal.js';

export type SitePhases = 'singlePhase' | 'splitPhase' | 'threePhase';

export type PerPhaseMeasurement = {
    phaseA: number;
    phaseB: number | null;
    phaseC: number | null;
};

export function getTotalFromPerPhaseMeasurement({
    phaseA,
    phaseB,
    phaseC,
}: PerPhaseMeasurement) {
    return new Decimal(phaseA)
        .plus(phaseB ?? 0)
        .plus(phaseC ?? 0)
        .toNumber();
}
