import { Controller, Get, Route } from 'tsoa';
import { getSunSpecData } from '../services/sunspecService.js';

@Route('sunspec')
export class SunSpecAusController extends Controller {
    @Get('data')
    public data() {
        return getSunSpecData();
    }
}
