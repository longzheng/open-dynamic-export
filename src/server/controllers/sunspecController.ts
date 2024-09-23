import { Controller, Get, Route, Tags } from 'tsoa';
import { getSunSpecData } from '../services/sunspecService.js';

@Tags('sunspec')
@Route('sunspec')
export class SunSpecAusController extends Controller {
    @Get('data')
    public data() {
        return getSunSpecData();
    }
}
