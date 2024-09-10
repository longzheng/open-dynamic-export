import { Controller, Get, Route } from 'tsoa';
import { getCertificateIds } from '../services/csipAusService.js';

@Route('csipAus')
export class CsipAusController extends Controller {
    @Get('id')
    public status() {
        return getCertificateIds();
    }
}
