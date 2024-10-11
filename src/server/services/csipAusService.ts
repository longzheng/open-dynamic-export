import 'dotenv/config';
import { getSep2Certificate } from '../../helpers/sep2Cert.js';
import {
    getCertificateFingerprint,
    getCertificateLfdi,
    getCertificateSfdi,
} from '../../sep2/helpers/cert.js';
import type { Sep2Limiter } from '../../limiters/sep2/index.js';
import type { ResponseRequiredType } from '../../sep2/models/responseRequired.js';
import { coordinatorService } from './coordinatorService.js';
import type { SupportedControlTypes } from '../../coordinator/helpers/inverterController.js';

type CertificateIds = {
    lfdi: string;
    sfdi: string;
};

export function getCertificateIds(): CertificateIds {
    const sep2Certificate = getSep2Certificate();
    const fingerprint = getCertificateFingerprint(sep2Certificate.cert);
    const lfdi = getCertificateLfdi(fingerprint);
    const sfdi = getCertificateSfdi(fingerprint);

    return {
        lfdi,
        sfdi,
    };
}

export function getCsipLimitSchedule(
    type: SupportedControlTypes,
): RandomizedControlSchedule[] {
    const sep2Limiter = coordinatorService.getLimiters().sep2;

    if (!sep2Limiter) {
        throw new Error('SEP2 limiter is not running');
    }

    const sep2LimiterClass = sep2Limiter as Sep2Limiter;

    return sep2LimiterClass
        .getSchedulerByControlType()
        [type].getControlSchedules();
}

// workaround tsoa type issue with zod infer types
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
