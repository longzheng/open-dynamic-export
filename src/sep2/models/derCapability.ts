import * as v from 'valibot';
import { numberToHex } from '../../helpers/number.js';
import { xmlns } from '../helpers/namespace.js';
import { activePowerSchema } from './activePower.js';
import { apparentPowerSchema } from './apparentPower.js';
import { derControlTypeSchema } from './derControlType.js';
import { derTypeSchema } from './derType.js';
import { doeControlTypeSchema } from './doeModesSupportedType.js';
import { reactivePowerSchema } from './reactivePower.js';
import { voltageRMSSchema } from './voltageRms.js';
import { powerFactorSchema } from './powerFactor.js';

export const derCapabilitySchema = v.object({
    modesSupported: v.pipe(
        derControlTypeSchema,
        v.description(
            'Bitmap indicating the DER Controls implemented by the device',
        ),
    ),
    doeModesSupported: v.pipe(
        doeControlTypeSchema,
        v.description(
            'Bitmap indicating the DOE controls enabled on the device. See DOEControlType for values.',
        ),
    ),
    type: v.pipe(derTypeSchema, v.description('Type of DER')),
    rtgMaxVA: v.pipe(
        apparentPowerSchema,
        v.description(
            'Maximum continuous apparent power output capability of the DER, in voltamperes',
        ),
    ),
    rtgMaxW: v.pipe(
        activePowerSchema,
        v.description(
            'Maximum continuous active power output capability of the DER, in watts. Represents combined generation plus storage output if DERType == 83.',
        ),
    ),
    rtgMaxVar: v.pipe(
        reactivePowerSchema,
        v.description(
            'Maximum continuous reactive power delivered by the DER, in var.',
        ),
    ),
    rtgMaxVarNeg: v.pipe(
        v.optional(reactivePowerSchema),
        v.description(
            'Maximum continuous reactive power received by the DER, in var. If absent, defaults to negative rtgMaxVar.',
        ),
    ),
    rtgMinPFOverExcited: v.pipe(
        v.optional(powerFactorSchema),
        v.description(
            'Minimum Power Factor displacement capability of the DER when injecting reactive power (over-excited); SHALL be a positive value between 0.0 (typically > 0.7) and 1.0. If absent, defaults to unity.',
        ),
    ),
    rtgMinPFUnderExcited: v.pipe(
        v.optional(powerFactorSchema),
        v.description(
            'Minimum Power Factor displacement capability of the DER when absorbing reactive power (under-excited); SHALL be a positive value between 0.0 (typically > 0.7) and 0.9999. If absent, defaults to rtgMinPFOverExcited.',
        ),
    ),
    rtgVNom: v.pipe(
        v.optional(voltageRMSSchema),
        v.description('AC voltage nominal rating.'),
    ),
});

export type DERCapability = v.InferOutput<typeof derCapabilitySchema>;

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
            rtgMaxVA: {
                multiplier: rtgMaxVA.multiplier,
                value: rtgMaxVA.value,
            },
            rtgMaxVar: {
                multiplier: rtgMaxVar.multiplier,
                value: rtgMaxVar.value,
            },
            rtgMaxVarNeg: rtgMaxVarNeg
                ? {
                      multiplier: rtgMaxVarNeg.multiplier,
                      value: rtgMaxVarNeg.value,
                  }
                : undefined,
            rtgMaxW: {
                multiplier: rtgMaxW.multiplier,
                value: rtgMaxW.value,
            },
            rtgMinPFOverExcited: rtgMinPFOverExcited
                ? {
                      displacement: rtgMinPFOverExcited.displacement,
                      multiplier: rtgMinPFOverExcited.multiplier,
                  }
                : undefined,
            rtgMinPFUnderExcited: rtgMinPFUnderExcited
                ? {
                      displacement: rtgMinPFUnderExcited.displacement,
                      multiplier: rtgMinPFUnderExcited.multiplier,
                  }
                : undefined,
            rtgVNom: rtgVNom
                ? {
                      multiplier: rtgVNom.multiplier,
                      value: rtgVNom.value,
                  }
                : undefined,
            type: type.toString(),
            'csipaus:doeModesSupported': numberToHex(
                doeModesSupported,
            ).padStart(2, '0'),
        },
    };
}
