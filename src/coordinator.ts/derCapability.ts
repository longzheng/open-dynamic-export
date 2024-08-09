import type { DERCapabilityResponse } from '../sep2/models/derCapability';
import { DERControlType } from '../sep2/models/derControlType';
import { DERType } from '../sep2/models/derType';
import { DOEModesSupportedType } from '../sep2/models/doeModesSupportedType';
import { type NameplateModel } from '../sunspec/models/nameplate';

// map DERCapabilityResponse from SunSpec Nameplate model
export function getDerCapabilityResponseFromSunSpec(
    nameplateModel: NameplateModel,
): DERCapabilityResponse {
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
            value: nameplateModel.WRtg,
            multiplier: nameplateModel.WRtg_SF,
        },
        rtgMaxVar: {
            value: nameplateModel.VARtg,
            multiplier: nameplateModel.VARtg_SF,
        },
        rtgMaxW: {
            value: nameplateModel.WRtg,
            multiplier: nameplateModel.WRtg_SF,
        },
        // there's no way to get the nominal voltage from the Nnamepate model
        // VNom is available from the DER Capacity 702 model but it's not widely available
        // https://sunspec.org/wp-content/uploads/2021/02/SunSpec-DER-Information-Model-Specification-V1-0-02-01-2021.pdf
        rtgVNom: undefined,
    };
}
