import type { SitePhases } from '../../helpers/phases';
import type { InverterModel } from '../models/inverter';
import { type MeterModel } from '../models/meter';

export function getSitePhasesFromMeter(meter: MeterModel): SitePhases {
    if (meter.ID === 201) {
        return 'singlePhase';
    }
    if (meter.ID === 202) {
        return 'splitPhase';
    }
    if (meter.ID === 203) {
        return 'threePhase';
    }
    throw new Error(`Unknown meter SunSpec model ID ${meter.ID}`);
}

export function getSitePhasesFromInverter(inverter: InverterModel): SitePhases {
    if (inverter.ID === 101) {
        return 'singlePhase';
    }
    if (inverter.ID === 102) {
        return 'splitPhase';
    }
    if (inverter.ID === 103) {
        return 'threePhase';
    }
    throw new Error(`Unknown inverter SunSpec model ID ${inverter.ID}`);
}
