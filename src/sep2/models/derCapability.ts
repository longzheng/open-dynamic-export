import { numberToHex } from '../../helpers/number.js';
import { activePowerSchema } from './activePower.js';
import { apparentPowerSchema } from './apparentPower.js';
import { derControlTypeSchema } from './derControlType.js';
import { derTypeSchema } from './derType.js';
import { doeControlTypeSchema } from './doeModesSupportedType.js';
import { xmlns } from '../helpers/namespace.js';
import { reactivePowerSchema } from './reactivePower.js';
import { voltageRMSSchema } from './voltageRms.js';
import { powerFactorSchema } from './powerFactor.js';
import { z } from 'zod';

export const derCapabilitySchema = z.object({
    modesSupported: derControlTypeSchema.describe(
        'Bitmap indicating the DER Controls implemented by the device',
    ),
    doeModesSupported: doeControlTypeSchema.describe(
        'Bitmap indicating the DOE controls enabled on the device. See DOEControlType for values.',
    ),
    type: derTypeSchema.describe('Type of DER'),
    rtgMaxVA: apparentPowerSchema.describe(
        'Maximum continuous apparent power output capability of the DER, in voltamperes',
    ),
    rtgMaxW: activePowerSchema.describe(
        'Maximum continuous active power output capability of the DER, in watts. Represents combined generation plus storage output if DERType == 83.',
    ),
    rtgMaxVar: reactivePowerSchema.describe(
        'Maximum continuous reactive power delivered by the DER, in var.',
    ),
    rtgMaxVarNeg: reactivePowerSchema
        .optional()
        .describe(
            'Maximum continuous reactive power received by the DER, in var. If absent, defaults to negative rtgMaxVar.',
        ),
    rtgMinPFOverExcited: powerFactorSchema
        .optional()
        .describe(
            'Minimum Power Factor displacement capability of the DER when injecting reactive power (over-excited); SHALL be a positive value between 0.0 (typically > 0.7) and 1.0. If absent, defaults to unity.',
        ),
    rtgMinPFUnderExcited: powerFactorSchema
        .optional()
        .describe(
            'Minimum Power Factor displacement capability of the DER when absorbing reactive power (under-excited); SHALL be a positive value between 0.0 (typically > 0.7) and 0.9999. If absent, defaults to rtgMinPFOverExcited.',
        ),
    rtgVNom: voltageRMSSchema.optional().describe('AC voltage nominal rating.'),
});

export type DERCapability = z.infer<typeof derCapabilitySchema>;

export function generateDerCapability({
    modesSupported,
    doeModesSupported,
    type,
    rtgMaxVA,
    rtgMaxW,
    rtgMaxVar,
    rtgMaxVarNeg,
    rtgMinPFOverExcited,
    rtgMinPFUnderExcited,
    rtgVNom,
}: DERCapability) {
    return {
        DERCapability: {
            $: { xmlns: xmlns._, 'xmlns:csipaus': xmlns.csipaus },
            modesSupported: numberToHex(modesSupported).padStart(8, '0'),
            'csipaus:doeModesSupported': numberToHex(doeModesSupported).padStart(8, '0'),
            type: type.toString(),
            rtgMaxVA,
            rtgMaxW,
            rtgMaxVar,
            rtgMaxVarNeg: rtgMaxVarNeg || undefined,
            rtgMinPFOverExcited: rtgMinPFOverExcited || undefined,
            rtgMinPFUnderExcited: rtgMinPFUnderExcited || undefined,
            rtgVNom: rtgVNom || undefined,
        },
    };
}
