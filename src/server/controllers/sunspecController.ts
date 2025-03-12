import { Controller, Get, OperationId, Route, Tags } from 'tsoa';
import { getSunSpecData } from '../services/sunspecService.js';

@Tags('sunspec')
@Route('api/sunspec')
export class SunSpecAusController extends Controller {
    @Get('data')
    @OperationId('sunspecData')
    public data() {
        return getSunSpecData();
    }
}
