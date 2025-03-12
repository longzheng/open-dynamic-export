import { Controller, Get, OperationId, Route, Tags } from 'tsoa';
import {
    getCertificateIds,
    getCsipLimitSchedule,
} from '../services/csipAusService.js';

@Tags('csipAus')
@Route('api/csipAus')
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
        return getCsipLimitSchedule('opModExpLimW');
    }

    @Get('generationLimitSchedule')
    @OperationId('generationLimitSchedule')
    public generationLimitSchedule() {
        return getCsipLimitSchedule('opModGenLimW');
    }

    @Get('connectionSchedule')
    @OperationId('connectionSchedule')
    public connectionSchedule() {
        return getCsipLimitSchedule('opModConnect');
    }

    @Get('energizeSchedule')
    @OperationId('energizeSchedule')
    public energizeSchedule() {
        return getCsipLimitSchedule('opModEnergize');
    }
}
