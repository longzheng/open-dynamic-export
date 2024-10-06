import { Controller, Get, OperationId, Route, Tags } from 'tsoa';
import { getCertificateIds } from '../services/csipAusService.js';

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
}
