import { type SitePhases } from '../../helpers/phases.js';
import { type InverterModel } from '../models/inverter.js';
import { type MeterModel } from '../models/meter.js';

export function getSitePhasesFromMeter(meter: MeterModel): SitePhases {
    switch (meter.ID) {
        case 201:
            return 'singlePhase';
        case 202:
            return 'splitPhase';
        case 203:
            return 'threePhase';
    }
}

export function getSitePhasesFromInverter(inverter: InverterModel): SitePhases {
    switch (inverter.ID) {
        case 101:
            return 'singlePhase';
        case 102:
            return 'splitPhase';
        case 103:
            return 'threePhase';
    }
}
