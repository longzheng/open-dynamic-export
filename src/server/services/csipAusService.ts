import type { ResponseRequiredType } from '../../sep2/models/responseRequired.js';
import type { SupportedControlTypes } from '../../coordinator/helpers/inverterController.js';
import { coordinatorService } from './coordinatorService.js';

export type CsipAusStatus = {
    connected: boolean;
    lfdi: string | null;
    sfdi: string | null;
};

export function getCsipAusStatus(): CsipAusStatus {
    const csipAusSetpoint = coordinatorService.getSetpoints().csipAus;

    if (!csipAusSetpoint) {
        return {
            connected: false,
            lfdi: null,
            sfdi: null,
        };
    }

    return csipAusSetpoint.getStatus();
}

export function getCsipLimitSchedule(
    type: SupportedControlTypes,
): RandomizedControlSchedule[] {
    const csipAusSetpoint = coordinatorService.getSetpoints().csipAus;

    if (!csipAusSetpoint) {
        throw new Error('CSIP-AUS setpoint is not running');
    }

    return csipAusSetpoint
        .getSchedulerByControlType()
        [type].getControlSchedules();
}

// workaround tsoa type issue with schema infer types
type RandomizedControlSchedule = ControlSchedule & {
    effectiveStartInclusive: Date;
    effectiveEndExclusive: Date;
};

type ControlSchedule = {
    startInclusive: Date;
    endExclusive: Date;
    randomizeStart: number | undefined;
    randomizeDuration: number | undefined;
    mRID: string;
    derControlBase: DERControlBase;
    responseRequired: ResponseRequiredType;
    replyToHref: string | undefined;
};

type DERControlBase = {
    opModImpLimW?: {
        value: number;
        multiplier: number;
    };
    opModExpLimW?: {
        value: number;
        multiplier: number;
    };
    opModGenLimW?: {
        value: number;
        multiplier: number;
    };
    opModLoadLimW?: {
        value: number;
        multiplier: number;
    };
    opModEnergize?: boolean;
    opModConnect?: boolean;
    rampTms?: number;
};
