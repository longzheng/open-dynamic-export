import { assertNonNull } from '../../../helpers/null.js';
import { type InverterModelfloat } from '../models/inverter.js';
import { getSitePhasesFromInverter } from './sitePhases.js';

export function getInverterMetrics(inverter: InverterModelfloat) {
    const phases = getSitePhasesFromInverter(inverter);

    const scaledValues = {
        A: inverter.A,
        AphA: inverter.AphA,
        AphB: inverter.AphB,
        AphC: inverter.AphC,
        PPVphAB: inverter.PPVphAB,
        PPVphBC: inverter.PPVphBC,
        PPVphCA: inverter.PPVphCA,
        PhVphA: inverter.PhVphA,
        PhVphB: inverter.PhVphB,
        PhVphC: inverter.PhVphC,
        W: inverter.W,
        Hz: inverter.Hz,
        VA: inverter.VA,
        VAr: inverter.VAr,
        PF: inverter.PF,
        WH: inverter.WH,
        DCA: inverter.DCA,
        DCV: inverter.DCV,
        DCW: inverter.DCW,
    };

    switch (phases) {
        case 'singlePhase': {
            return {
                phases,
                A: scaledValues.A,
                AphA: scaledValues.AphA,
                AphB: null,
                AphC: null,
                PPVphAB: scaledValues.PPVphAB,
                PPVphBC: null,
                PPVphCA: null,
                PhVphA: scaledValues.PhVphA,
                PhVphB: null,
                PhVphC: null,
                W: scaledValues.W,
                Hz: scaledValues.Hz,
                VA: scaledValues.VA,
                VAr: scaledValues.VAr,
                PF: scaledValues.PF,
                WH: scaledValues.WH,
                DCA: scaledValues.DCA,
                DCV: scaledValues.DCV,
                DCW: scaledValues.DCW,
            };
        }
        case 'splitPhase': {
            return {
                phases,
                A: scaledValues.A,
                AphA: scaledValues.AphA,
                AphB: assertNonNull(scaledValues.AphB),
                AphC: null,
                PPVphAB: scaledValues.PPVphAB,
                PPVphBC: scaledValues.PPVphBC,
                PPVphCA: null,
                PhVphA: scaledValues.PhVphA,
                PhVphB: scaledValues.PhVphB,
                PhVphC: null,
                W: scaledValues.W,
                Hz: scaledValues.Hz,
                VA: scaledValues.VA,
                VAr: scaledValues.VAr,
                PF: scaledValues.PF,
                WH: scaledValues.WH,
                DCA: scaledValues.DCA,
                DCV: scaledValues.DCV,
                DCW: scaledValues.DCW,
            };
        }
        case 'threePhase': {
            return {
                phases,
                A: scaledValues.A,
                AphA: scaledValues.AphA,
                AphB: assertNonNull(scaledValues.AphB),
                AphC: assertNonNull(scaledValues.AphC),
                PPVphAB: scaledValues.PPVphAB,
                PPVphBC: scaledValues.PPVphBC,
                PPVphCA: scaledValues.PPVphCA,
                PhVphA: scaledValues.PhVphA,
                PhVphB: scaledValues.PhVphB,
                PhVphC: scaledValues.PhVphC,
                W: scaledValues.W,
                Hz: scaledValues.Hz,
                VA: scaledValues.VA,
                VAr: scaledValues.VAr,
                PF: scaledValues.PF,
                WH: scaledValues.WH,
                DCA: scaledValues.DCA,
                DCV: scaledValues.DCV,
                DCW: scaledValues.DCW,
            };
        }
    }
}
