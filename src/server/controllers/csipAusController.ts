import { Controller, Get, OperationId, Route, Tags } from 'tsoa';
import { getCertificateIds } from '../services/csipAusService.js';
import { coordinatorService } from '../services/coordinatorService.js';
import type { Sep2Limiter } from '../../limiters/sep2/index.js';

@Tags('csipAus')
@Route('csipAus')
export class CsipAusController extends Controller {
    /**
     * Get CSIP-AUS device certificate LFID and SFDI
     **/
    @Get('id')
    @OperationId('csipAusStatus')
    public status() {
        return getCertificateIds();
    }

    @Get('exportLimitSchedule')
    @OperationId('exportLimitSchedule')
    public exportLimitSchedule() {
        const sep2Limiter = coordinatorService.getLimiters().sep2;

        if (!sep2Limiter) {
            throw new Error('SEP2 limiter is not running');
        }

        const sep2LimiterClass = sep2Limiter as Sep2Limiter;

        return sep2LimiterClass
            .getSchedulerByControlType()
            .opModExpLimW.getControlSchedules();
    }

    @Get('generationLimitSchedule')
    @OperationId('generationLimitSchedule')
    public generationLimitSchedule() {
        const sep2Limiter = coordinatorService.getLimiters().sep2;

        if (!sep2Limiter) {
            throw new Error('SEP2 limiter is not running');
        }

        const sep2LimiterClass = sep2Limiter as Sep2Limiter;

        return sep2LimiterClass
            .getSchedulerByControlType()
            .opModGenLimW.getControlSchedules();
    }

    @Get('connectionSchedule')
    @OperationId('connectionSchedule')
    public connectionSchedule() {
        const sep2Limiter = coordinatorService.getLimiters().sep2;

        if (!sep2Limiter) {
            throw new Error('SEP2 limiter is not running');
        }

        const sep2LimiterClass = sep2Limiter as Sep2Limiter;

        return sep2LimiterClass
            .getSchedulerByControlType()
            .opModConnect.getControlSchedules();
    }

    @Get('energizeSchedule')
    @OperationId('energizeSchedule')
    public energizeSchedule() {
        const sep2Limiter = coordinatorService.getLimiters().sep2;

        if (!sep2Limiter) {
            throw new Error('SEP2 limiter is not running');
        }

        const sep2LimiterClass = sep2Limiter as Sep2Limiter;

        return sep2LimiterClass
            .getSchedulerByControlType()
            .opModEnergize.getControlSchedules();
    }
}
