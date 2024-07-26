import { assertNonNull } from '../../null';
import {
    averageNumbersArray,
    averageNumbersNullableArray,
    numberNullableWithPow10,
    numberWithPow10,
    sumNumbersArray,
    sumNumbersNullableArray,
} from '../../number';
import type { InverterModel } from '../models/inverter';
import { getSitePhasesFromInverter } from './sitePhases';

export function getInverterMetrics(inverter: InverterModel) {
    const phases = getSitePhasesFromInverter(inverter);

    const scaledValues = {
        A: numberWithPow10(inverter.A, inverter.A_SF),
        AphA: numberWithPow10(inverter.AphA, inverter.A_SF),
        AphB: numberNullableWithPow10(inverter.AphB, inverter.A_SF),
        AphC: numberNullableWithPow10(inverter.AphC, inverter.A_SF),
        PPVphAB: numberNullableWithPow10(inverter.PPVphAB, inverter.V_SF),
        PPVphBC: numberNullableWithPow10(inverter.PPVphBC, inverter.V_SF),
        PPVphCA: numberNullableWithPow10(inverter.PPVphCA, inverter.V_SF),
        PhVphA: numberNullableWithPow10(inverter.PhVphA, inverter.V_SF),
        PhVphB: numberNullableWithPow10(inverter.PhVphB, inverter.V_SF),
        PhVphC: numberNullableWithPow10(inverter.PhVphC, inverter.V_SF),
        W: numberWithPow10(inverter.W, inverter.W_SF),
        Hz: numberWithPow10(inverter.Hz, inverter.Hz_SF),
        VA:
            inverter.VA_SF !== null
                ? numberNullableWithPow10(inverter.VA, inverter.VA_SF)
                : null,
        VAr:
            inverter.VAr_SF !== null
                ? numberNullableWithPow10(inverter.VAr, inverter.VAr_SF)
                : null,
        PF:
            inverter.PF_SF !== null
                ? numberNullableWithPow10(inverter.PF, inverter.PF_SF)
                : null,
        WH: numberWithPow10(inverter.WH, inverter.WH_SF),
        DCA:
            inverter.DCA_SF !== null
                ? numberNullableWithPow10(inverter.DCA, inverter.DCA_SF)
                : null,
        DCV:
            inverter.DCV_SF !== null
                ? numberNullableWithPow10(inverter.DCV, inverter.DCV_SF)
                : null,
        DCW:
            inverter.DCW_SF !== null
                ? numberNullableWithPow10(inverter.DCW, inverter.DCW_SF)
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

export function getAggregatedInverterMetrics(inverters: InverterModel[]) {
    const metrics = inverters.map(getInverterMetrics);

    const firstInverter = metrics.at(0);
    if (!firstInverter) {
        throw new Error('At least one inverter must be provided');
    }

    const phases = firstInverter.phases;

    if (metrics.some((metric) => metric.phases !== phases)) {
        throw new Error('Different phases detected across inverters');
    }

    switch (phases) {
        case 'singlePhase': {
            return {
                phases,
                A: sumNumbersArray(metrics.map((metric) => metric.A)),
                AphA: sumNumbersArray(metrics.map((metric) => metric.AphA)),
                AphB: null,
                AphC: null,
                PPVphAB: averageNumbersNullableArray(
                    metrics.map((metric) => metric.PPVphAB),
                ),
                PPVphBC: null,
                PPVphCA: null,
                PhVphA: averageNumbersNullableArray(
                    metrics.map((metric) => metric.PhVphA),
                ),
                PhVphB: null,
                PhVphC: null,
                W: sumNumbersArray(metrics.map((metric) => metric.W)),
                Hz: averageNumbersArray(metrics.map((metric) => metric.Hz)),
                VA: averageNumbersNullableArray(
                    metrics.map((metric) => metric.VA),
                ),
                VAr: averageNumbersNullableArray(
                    metrics.map((metric) => metric.VAr),
                ),
                PF: averageNumbersNullableArray(
                    metrics.map((metric) => metric.PF),
                ),
                WH: sumNumbersArray(metrics.map((metric) => metric.WH)),
                DCA: averageNumbersNullableArray(
                    metrics.map((metric) => metric.DCA),
                ),
                DCV: averageNumbersNullableArray(
                    metrics.map((metric) => metric.DCV),
                ),
                DCW: averageNumbersNullableArray(
                    metrics.map((metric) => metric.DCW),
                ),
            };
        }
        case 'splitPhase': {
            return {
                phases,
                A: sumNumbersArray(metrics.map((metric) => metric.A)),
                AphA: sumNumbersArray(metrics.map((metric) => metric.AphA)),
                AphB: assertNonNull(
                    sumNumbersNullableArray(
                        metrics.map((metric) => metric.AphB),
                    ),
                ),
                AphC: null,
                PPVphAB: averageNumbersNullableArray(
                    metrics.map((metric) => metric.PPVphAB),
                ),
                PPVphBC: averageNumbersNullableArray(
                    metrics.map((metric) => metric.PPVphBC),
                ),
                PPVphCA: null,
                PhVphA: averageNumbersNullableArray(
                    metrics.map((metric) => metric.PhVphA),
                ),
                PhVphB: averageNumbersNullableArray(
                    metrics.map((metric) => metric.PhVphB),
                ),
                PhVphC: null,
                W: sumNumbersArray(metrics.map((metric) => metric.W)),
                Hz: averageNumbersArray(metrics.map((metric) => metric.Hz)),
                VA: averageNumbersNullableArray(
                    metrics.map((metric) => metric.VA),
                ),
                VAr: averageNumbersNullableArray(
                    metrics.map((metric) => metric.VAr),
                ),
                PF: averageNumbersNullableArray(
                    metrics.map((metric) => metric.PF),
                ),
                WH: sumNumbersArray(metrics.map((metric) => metric.WH)),
                DCA: averageNumbersNullableArray(
                    metrics.map((metric) => metric.DCA),
                ),
                DCV: averageNumbersNullableArray(
                    metrics.map((metric) => metric.DCV),
                ),
                DCW: averageNumbersNullableArray(
                    metrics.map((metric) => metric.DCW),
                ),
            };
        }
        case 'threePhase': {
            return {
                phases,
                A: sumNumbersArray(metrics.map((metric) => metric.A)),
                AphA: sumNumbersArray(metrics.map((metric) => metric.AphA)),
                AphB: assertNonNull(
                    sumNumbersNullableArray(
                        metrics.map((metric) => metric.AphB),
                    ),
                ),
                AphC: assertNonNull(
                    sumNumbersNullableArray(
                        metrics.map((metric) => metric.AphC),
                    ),
                ),
                PPVphAB: averageNumbersNullableArray(
                    metrics.map((metric) => metric.PPVphAB),
                ),
                PPVphBC: averageNumbersNullableArray(
                    metrics.map((metric) => metric.PPVphBC),
                ),
                PPVphCA: averageNumbersNullableArray(
                    metrics.map((metric) => metric.PPVphCA),
                ),
                PhVphA: averageNumbersNullableArray(
                    metrics.map((metric) => metric.PhVphA),
                ),
                PhVphB: averageNumbersNullableArray(
                    metrics.map((metric) => metric.PhVphB),
                ),
                PhVphC: averageNumbersNullableArray(
                    metrics.map((metric) => metric.PhVphC),
                ),
                W: sumNumbersArray(metrics.map((metric) => metric.W)),
                Hz: averageNumbersArray(metrics.map((metric) => metric.Hz)),
                VA: averageNumbersNullableArray(
                    metrics.map((metric) => metric.VA),
                ),
                VAr: averageNumbersNullableArray(
                    metrics.map((metric) => metric.VAr),
                ),
                PF: averageNumbersNullableArray(
                    metrics.map((metric) => metric.PF),
                ),
                WH: sumNumbersArray(metrics.map((metric) => metric.WH)),
                DCA: averageNumbersNullableArray(
                    metrics.map((metric) => metric.DCA),
                ),
                DCV: averageNumbersNullableArray(
                    metrics.map((metric) => metric.DCV),
                ),
                DCW: averageNumbersNullableArray(
                    metrics.map((metric) => metric.DCW),
                ),
            };
        }
    }
}
