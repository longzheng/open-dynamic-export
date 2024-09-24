import { Controller, Get, OperationId, Route, Tags } from 'tsoa';
import { coordinatorService } from '../services/coordinatorService.js';

@Tags('inverterController')
@Route('inverterController')
export class InverterController extends Controller {
    @Get('data')
    @OperationId('inverterControllerData')
    public data() {
        return coordinatorService.inverterControllerData();
    }
}
