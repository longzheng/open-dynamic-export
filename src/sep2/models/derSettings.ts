import { numberToHex } from '../../helpers/number.js';
import { activePowerSchema } from './activePower.js';
import { apparentPowerSchema } from './apparentPower.js';
import { dateToStringSeconds } from '../helpers/date.js';
import { derControlTypeSchema } from './derControlType.js';
import { xmlns } from '../helpers/namespace.js';
import { reactivePowerSchema } from './reactivePower.js';
import { doeControlTypeSchema } from './doeModesSupportedType.js';
import { z } from 'zod';

export const derSettingsSchema = z.object({
    updatedTime: z.coerce.date(),
    modesEnabled: derControlTypeSchema,
    doeModesEnabled: doeControlTypeSchema.describe(
        'Bitmap indicating the DOE controls implemented by the device. See DOEControlType for values.',
    ),
    setGradW: z
        .number()
        .describe(
            'Set default rate of change (ramp rate) of active power output due to command or internal action, defined in %setWMax / second. Resolution is in hundredths of a percent/second. A value of 0 means there is no limit. Interpreted as a percentage change in output capability limit per second when used as a default ramp rate.',
        ),
    setMaxVA: apparentPowerSchema
        .optional()
        .describe(
            'Set limit for maximum apparent power capability of the DER (in VA). Defaults to rtgMaxVA.',
        ),
    setMaxW: activePowerSchema.describe(
        'Set limit for maximum active power capability of the DER (in W). Defaults to rtgMaxW.',
    ),
    setMaxVar: reactivePowerSchema
        .optional()
        .describe(
            'Set limit for maximum reactive power delivered by the DER (in var). SHALL be a positive value <= rtgMaxVar (default).',
        ),
});

export type DERSettings = z.infer<typeof derSettingsSchema>;

export function generateDerSettingsResponse({
    updatedTime,
    modesEnabled,
    doeModesEnabled,
    setGradW,
    setMaxVA,
    setMaxW,
    setMaxVar,
}: DERSettings) {
    return {
        DERSettings: {
            $: { xmlns: xmlns._, 'xmlns:csipaus': xmlns.csipaus },
            updatedTime: dateToStringSeconds(updatedTime),
            modesEnabled: numberToHex(modesEnabled).padStart(8, '0'),
            'csipaus:doeModesEnabled': numberToHex(doeModesEnabled).padStart(
                8,
                '0',
            ),
            setGradW,
            setMaxW,
            setMaxVA,
            setMaxVar,
        },
    };
}
