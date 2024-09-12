import { Controller, Get, Route, Tags } from 'tsoa';
import { getCertificateIds } from '../services/csipAusService.js';

@Tags('csipAus')
@Route('csipAus')
export class CsipAusController extends Controller {
    /**
     * Get CSIP-AUS device certificate LFID and SFDI
     **/
    @Get('id')
    public status() {
        return getCertificateIds();
    }
}
