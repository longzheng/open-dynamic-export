import { type SitePhases } from '../../../helpers/phases.js';
import { type InverterModelfloat } from '../models/inverter.js';
import { type MeterModelfloat } from '../models/meter.js';

export function getSitePhasesFromMeter(
    meterfloat: MeterModelfloat,
): SitePhases {
    switch (meterfloat.ID) {
        case 211:
            return 'singlePhase';
        case 212:
            return 'splitPhase';
        case 213:
            return 'threePhase';
    }
}

export function getSitePhasesFromInverter(
    inverterfloat: InverterModelfloat,
): SitePhases {
    switch (inverterfloat.ID) {
        case 111:
            return 'singlePhase';
        case 112:
            return 'splitPhase';
        case 113:
            return 'threePhase';
    }
}
