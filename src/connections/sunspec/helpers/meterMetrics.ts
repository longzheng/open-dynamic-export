import { assertNonNull } from '../../../helpers/null.js';
import {
    numberWithPow10,
    numberNullableWithPow10,
} from '../../../helpers/number.js';
import { type MeterModel } from '../models/meter.js';
import { getSitePhasesFromMeter } from './sitePhases.js';

export function getMeterMetrics(meter: MeterModel) {
    const phases = getSitePhasesFromMeter(meter);

    const scaledValues = {
        A: numberWithPow10(meter.A, meter.A_SF),
        AphA: numberNullableWithPow10(meter.AphA, meter.A_SF),
        AphB: numberNullableWithPow10(meter.AphB, meter.A_SF),
        AphC: numberNullableWithPow10(meter.AphC, meter.A_SF),
        PhV: numberNullableWithPow10(meter.PhV, meter.V_SF),
        PhVphA: numberNullableWithPow10(meter.PhVphA, meter.V_SF),
        PhVphB: numberNullableWithPow10(meter.PhVphB, meter.V_SF),
        PhVphC: numberNullableWithPow10(meter.PhVphC, meter.V_SF),
        PPV: numberNullableWithPow10(meter.PPV, meter.V_SF),
        PPVphAB: numberNullableWithPow10(meter.PPVphAB, meter.V_SF),
        PPVphBC: numberNullableWithPow10(meter.PPVphBC, meter.V_SF),
        PPVphCA: numberNullableWithPow10(meter.PPVphCA, meter.V_SF),
        Hz: numberWithPow10(meter.Hz, meter.Hz_SF),
        W: numberWithPow10(meter.W, meter.W_SF),
        WphA: numberNullableWithPow10(meter.WphA, meter.W_SF),
        WphB: numberNullableWithPow10(meter.WphB, meter.W_SF),
        WphC: numberNullableWithPow10(meter.WphC, meter.W_SF),
        VA: meter.VA_SF ? numberNullableWithPow10(meter.VA, meter.VA_SF) : null,
        VAphA:
            meter.VA_SF !== null
                ? numberNullableWithPow10(meter.VAphA, meter.VA_SF)
                : null,
        VAphB:
            meter.VA_SF !== null
                ? numberNullableWithPow10(meter.VAphB, meter.VA_SF)
                : null,
        VAphC:
            meter.VA_SF !== null
                ? numberNullableWithPow10(meter.VAphC, meter.VA_SF)
                : null,
        VAR:
            meter.VAR_SF !== null
                ? numberNullableWithPow10(meter.VAR, meter.VAR_SF)
                : null,
        VARphA:
            meter.VAR_SF !== null
                ? numberNullableWithPow10(meter.VARphA, meter.VAR_SF)
                : null,
        VARphB:
            meter.VAR_SF !== null
                ? numberNullableWithPow10(meter.VARphB, meter.VAR_SF)
                : null,
        VARphC:
            meter.VAR_SF !== null
                ? numberNullableWithPow10(meter.VARphC, meter.VAR_SF)
                : null,
        PF:
            meter.PF_SF !== null
                ? numberNullableWithPow10(meter.PF, meter.PF_SF)
                : null,
        PFphA:
            meter.PF_SF !== null
                ? numberNullableWithPow10(meter.PFphA, meter.PF_SF)
                : null,
        PFphB:
            meter.PF_SF !== null
                ? numberNullableWithPow10(meter.PFphB, meter.PF_SF)
                : null,
        PFphC:
            meter.PF_SF !== null
                ? numberNullableWithPow10(meter.PFphC, meter.PF_SF)
                : null,
    };

    switch (phases) {
        case 'singlePhase': {
            return {
                phases,
                A: scaledValues.A,
                AphA: scaledValues.AphA,
                AphB: null,
                AphC: null,
                PhV: scaledValues.PhV,
                PhVphA: scaledValues.PhVphA,
                PhVphB: null,
                PhVphC: null,
                PPV: scaledValues.PPV,
                PPVphAB: scaledValues.PPVphAB,
                PPVphBC: null,
                PPVphCA: null,
                Hz: scaledValues.Hz,
                W: scaledValues.W,
                WphA: scaledValues.WphA,
                WphB: null,
                WphC: null,
                VA: scaledValues.VA,
                VAphA: scaledValues.VAphA,
                VAphB: null,
                VAphC: null,
                VAR: scaledValues.VAR,
                VARphA: scaledValues.VARphA,
                VARphB: null,
                VARphC: null,
                PF: scaledValues.PF,
                PFphA: scaledValues.PFphA,
                PFphB: null,
                PFphC: null,
            };
        }
        case 'splitPhase': {
            return {
                phases,
                A: scaledValues.A,
                AphA: scaledValues.AphA,
                AphB: assertNonNull(scaledValues.AphB),
                AphC: null,
                PhV: scaledValues.PhV,
                PhVphA: scaledValues.PhVphA,
                PhVphB: scaledValues.PhVphB,
                PhVphC: null,
                PPV: scaledValues.PPV,
                PPVphAB: scaledValues.PPVphAB,
                PPVphBC: null,
                PPVphCA: null,
                Hz: scaledValues.Hz,
                W: scaledValues.W,
                WphA: scaledValues.WphA,
                WphB: scaledValues.WphB,
                WphC: null,
                VA: scaledValues.VA,
                VAphA: scaledValues.VAphA,
                VAphB: scaledValues.VAphB,
                VAphC: null,
                VAR: scaledValues.VAR,
                VARphA: scaledValues.VARphA,
                VARphB: scaledValues.VARphB,
                VARphC: null,
                PF: scaledValues.PF,
                PFphA: scaledValues.PFphA,
                PFphB: scaledValues.PFphB,
                PFphC: null,
            };
        }
        case 'threePhase': {
            return {
                phases,
                A: scaledValues.A,
                AphA: scaledValues.AphA,
                AphB: assertNonNull(scaledValues.AphB),
                AphC: assertNonNull(scaledValues.AphC),
                PhV: scaledValues.PhV,
                PhVphA: scaledValues.PhVphA,
                PhVphB: scaledValues.PhVphB,
                PhVphC: scaledValues.PhVphC,
                PPV: scaledValues.PPV,
                PPVphAB: scaledValues.PPVphAB,
                PPVphBC: scaledValues.PPVphBC,
                PPVphCA: scaledValues.PPVphCA,
                Hz: scaledValues.Hz,
                W: scaledValues.W,
                WphA: scaledValues.WphA,
                WphB: scaledValues.WphB,
                WphC: scaledValues.WphC,
                VA: scaledValues.VA,
                VAphA: scaledValues.VAphA,
                VAphB: scaledValues.VAphB,
                VAphC: scaledValues.VAphC,
                VAR: scaledValues.VAR,
                VARphA: scaledValues.VARphA,
                VARphB: scaledValues.VARphB,
                VARphC: scaledValues.VARphC,
                PF: scaledValues.PF,
                PFphA: scaledValues.PFphA,
                PFphB: scaledValues.PFphB,
                PFphC: scaledValues.PFphC,
            };
        }
    }
}
