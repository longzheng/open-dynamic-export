import { numberToHex } from '../../number';
import { type ActivePower } from './activePower';
import { type ApparentPower } from './apparentPower';
import type { DERControlType } from './derControlType';
import type { DERType } from './derType';
import type { DOEModesSupportedType } from './doeModesSupportedType';
import { xmlns } from '../helpers/namespace';
import { type ReactivePower } from './reactivePower';
import { type VoltageRMS } from './voltageRms';

export type DERCapabilityResponse = {
    modesSupported: DERControlType;
    doeModesSupported: DOEModesSupportedType;
    type: DERType;
    // Maximum continuous apparent power output capability of the DER, in voltamperes
    rtgMaxVA: ApparentPower;
    // Maximum continuous active power output capability of the DER, in watts. Represents combined generation plus storage output if DERType == 83.
    rtgMaxW: ActivePower;
    // Maximum continuous reactive power delivered by the DER, in var.
    rtgMaxVar: ReactivePower;
    // AC voltage nominal rating.
    rtgVNom: VoltageRMS;
    // TODO: partially implemented
};

export function generateDerCapabilityResponse({
    modesSupported,
    doeModesSupported,
    type,
    rtgMaxVA,
    rtgMaxW,
    rtgMaxVar,
    rtgVNom,
}: DERCapabilityResponse) {
    return {
        DERCapability: {
            $: { xmlns: xmlns._, 'xmlns:csipaus': xmlns.csipaus },
            modesSupported: numberToHex(modesSupported).padStart(8, '0'),
            'csipaus:doeModesSupported': numberToHex(
                doeModesSupported,
            ).padStart(8, '0'),
            type: type.toString(),
            rtgMaxVA,
            rtgMaxW,
            rtgMaxVar,
            rtgVNom,
        },
    };
}
