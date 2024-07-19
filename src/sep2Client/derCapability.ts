import { convertToHex } from '../number';
import { generateActivePowerResponse, type ActivePower } from './activePower';
import {
    generateApparentPowerResponse,
    type ApparentPower,
} from './apparentPower';
import type { DERControlType } from './derControlType';
import type { DERType } from './derType';
import type { DOEModesSupportedType } from './doeModesSupportedType';
import { xmlns } from './namespace';
import {
    generateReactivePowerResponse,
    type ReactivePower,
} from './reactivePower';
import { generateVoltageRmsResponse, type VoltageRMS } from './voltageRms';

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
            modesSupported: convertToHex(modesSupported).padStart(8, '0'),
            'csipaus:doeModesSupported': convertToHex(
                doeModesSupported,
            ).padStart(8, '0'),
            type: type.toString(),
            rtgMaxVA: generateApparentPowerResponse(rtgMaxVA),
            rtgMaxW: generateActivePowerResponse(rtgMaxW),
            rtgMaxVar: generateReactivePowerResponse(rtgMaxVar),
            rtgVNom: generateVoltageRmsResponse(rtgVNom),
        },
    };
}
