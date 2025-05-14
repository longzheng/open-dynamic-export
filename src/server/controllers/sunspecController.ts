import { Controller, Get, OperationId, Query, Route, Tags } from 'tsoa';
import { getSunSpecData } from '../services/sunspecService.js';
import { getSunSpecfloatData } from '../services/sunspecServicefloat.js';

@Tags('sunspec')
@Route('api/sunspec')
export class SunSpecAusController extends Controller {
    @Get('data')
    @OperationId('sunspecData')
    public async data(
        @Query() type: 'sunspec' | 'sunspecfloat',
    ): Promise<unknown> {
        if (type === 'sunspecfloat') {
            return getSunSpecfloatData();
        }
        return getSunSpecData();
    }
}
