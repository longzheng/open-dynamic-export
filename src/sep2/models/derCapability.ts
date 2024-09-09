import { numberToHex } from '../../helpers/number.js';
import { type ActivePower } from './activePower.js';
import { type ApparentPower } from './apparentPower.js';
import type { DERControlType } from './derControlType.js';
import type { DERType } from './derType.js';
import type { DOEModesSupportedType } from './doeModesSupportedType.js';
import { xmlns } from '../helpers/namespace.js';
import { type ReactivePower } from './reactivePower.js';
import { type VoltageRMS } from './voltageRms.js';

export type DERCapability = {
    // Bitmap indicating the DER Controls implemented by the device
    modesSupported: DERControlType;
    // Bitmap indicating the CSIP-AUS controls implemented
    doeModesSupported: DOEModesSupportedType;
    // Type of DER
    type: DERType;
    // Maximum continuous apparent power output capability of the DER, in voltamperes
    rtgMaxVA: ApparentPower;
    // Maximum continuous active power output capability of the DER, in watts. Represents combined generation plus storage output if DERType == 83.
    rtgMaxW: ActivePower;
    // Maximum continuous reactive power delivered by the DER, in var.
    rtgMaxVar: ReactivePower;
    // AC voltage nominal rating.
    rtgVNom: VoltageRMS | undefined;
    // TODO: partially implemented
};

export function generateDerCapability({
    modesSupported,
    doeModesSupported,
    type,
    rtgMaxVA,
    rtgMaxW,
    rtgMaxVar,
    rtgVNom,
}: DERCapability) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: { DERCapability: any } = {
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
        },
    };

    if (rtgVNom) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        response.DERCapability.rtgVNom = rtgVNom;
    }

    return response;
}
