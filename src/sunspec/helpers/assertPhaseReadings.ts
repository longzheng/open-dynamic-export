import type { SitePhases } from '../../power';

// ensure the expected phase readings match the site's phases
export function assertPhaseReadings({
    sitePhases,
    phaseA,
    phaseB,
    phaseC,
}: {
    sitePhases: SitePhases;
    phaseA: number | null;
    phaseB: number | null;
    phaseC: number | null;
}): {
    phaseA: number;
    phaseB: number | undefined;
    phaseC: number | undefined;
} {
    if (phaseA === null) {
        throw new Error('Phase A is missing');
    }

    switch (sitePhases) {
        case 'singlePhase': {
            return {
                phaseA,
                phaseB: undefined,
                phaseC: undefined,
            };
        }
        case 'splitPhase': {
            if (phaseB === null) {
                throw new Error('Phase B is missing');
            }

            return {
                phaseA,
                phaseB,
                phaseC: undefined,
            };
        }
        case 'threePhase': {
            if (phaseB === null) {
                throw new Error('Phase B is missing');
            }
            if (phaseC === null) {
                throw new Error('Phase C is missing');
            }

            return {
                phaseA,
                phaseB,
                phaseC,
            };
        }
    }
}
