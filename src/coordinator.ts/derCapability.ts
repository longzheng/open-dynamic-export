import { convertNumberToBaseAndPow10Exponent } from '../number';
import type { DERCapabilityResponse } from '../sep2/models/derCapability';
import { DERControlType } from '../sep2/models/derControlType';
import { DERType } from '../sep2/models/derType';
import { DOEModesSupportedType } from '../sep2/models/doeModesSupportedType';
import { getAggregatedNameplateMetrics } from '../sunspec/helpers/nameplateMetrics';
import { type NameplateModel } from '../sunspec/models/nameplate';

// map DERCapabilityResponse from multiple SunSpec Nameplate models
export function getDerCapabilityResponseFromSunSpecArray(
    nameplateModels: NameplateModel[],
): DERCapabilityResponse {
    const metrics = getAggregatedNameplateMetrics(nameplateModels);
    const rtgMaxVA = convertNumberToBaseAndPow10Exponent(metrics.VARtg);
    const rtgMaxW = convertNumberToBaseAndPow10Exponent(metrics.WRtg);
    const rtgMaxVar = convertNumberToBaseAndPow10Exponent(metrics.VArRtgQ1);

    return {
        // hard-coded modes
        modesSupported:
            DERControlType.opModEnergize |
            DERControlType.opModMaxLimW |
            DERControlType.opModTargetW,
        // hard-coded DOE modes
        doeModesSupported: DOEModesSupportedType.opModExpLimW,
        // assume PV for now
        type: DERType.PhotovoltaicSystem,
        rtgMaxVA: {
            value: rtgMaxVA.base,
            multiplier: rtgMaxVA.pow10,
        },
        rtgMaxVar: {
            value: rtgMaxVar.base,
            multiplier: rtgMaxVar.pow10,
        },
        rtgMaxW: {
            value: rtgMaxW.base,
            multiplier: rtgMaxW.pow10,
        },
        // there's no way to get the nominal voltage from the Nnamepate model
        // VNom is available from the DER Capacity 702 model but it's not widely available
        // https://sunspec.org/wp-content/uploads/2021/02/SunSpec-DER-Information-Model-Specification-V1-0-02-01-2021.pdf
        rtgVNom: undefined,
    };
}
