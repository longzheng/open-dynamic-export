import { Controller, Get, OperationId, Route, Tags } from 'tsoa';
import { coordinatorService } from '../services/coordinatorService.js';
import type { Sep2Limiter } from '../../limiters/sep2/index.js';

@Tags('limiters')
@Route('limiters')
export class LimitersController extends Controller {
    @Get('csipAus')
    @OperationId('csipAus')
    public csipAus() {
        const sep2Limiter = coordinatorService.getLimiters().sep2;

        if (!sep2Limiter) {
            throw new Error('SEP2 limiter is not running');
        }

        const sep2LimiterClass = sep2Limiter as Sep2Limiter;

        return sep2LimiterClass
            .getSchedulerByControlType()
            .opModExpLimW.getControlSchedules();
    }
}
