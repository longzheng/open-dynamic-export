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
    return phaseA + (phaseB ?? 0) + (phaseC ?? 0);
}
