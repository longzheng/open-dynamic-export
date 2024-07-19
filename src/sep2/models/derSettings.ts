import { numberToHex } from '../../number';
import { generateActivePowerResponse, type ActivePower } from './activePower';
import {
    generateApparentPowerResponse,
    type ApparentPower,
} from '../helpers/apparentPower';
import { dateToStringSeconds } from '../helpers/date';
import type { DERControlType } from './derControlType';
import { xmlns } from '../helpers/namespace';
import {
    generateReactivePowerResponse,
    type ReactivePower,
} from './reactivePower';

export type DERSettings = {
    updatedTime: Date;
    modesEnabled: DERControlType;
    // Set default rate of change (ramp rate) of active power output due to command or internal action, defined in %setWMax / second. Resolution is in hundredths of a percent/second. A value of 0 means there is no limit. Interpreted as a percentage change in output capability limit per second when used as a default ramp rate.
    setGradW: number;
    // Set limit for maximum apparent power capability of the DER (in VA). Defaults to rtgMaxVA.
    setMaxVA: ApparentPower;
    // Set limit for maximum active power capability of the DER (in W). Defaults to rtgMaxW.
    setMaxW: ActivePower;
    // Set limit for maximum reactive power delivered by the DER (in var). SHALL be a positive value <= rtgMaxVar (default).
    setMaxVar: ReactivePower;
};

export function generateDerSettingsResponse({
    updatedTime,
    modesEnabled,
    setGradW,
    setMaxVA,
    setMaxW,
    setMaxVar,
}: DERSettings) {
    return {
        DERSettings: {
            $: { xmlns: xmlns._ },
            updatedTime: dateToStringSeconds(updatedTime),
            modesEnabled: numberToHex(modesEnabled).padStart(8, '0'),
            setGradW: setGradW.toString(),
            setMaxVA: generateApparentPowerResponse(setMaxVA),
            setMaxW: generateActivePowerResponse(setMaxW),
            setMaxVar: generateReactivePowerResponse(setMaxVar),
        },
    };
}
