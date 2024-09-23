import { Controller, Get, Route, Tags } from 'tsoa';
import { coordinatorService } from '../services/coordinatorService.js';

@Tags('inverterController')
@Route('inverterController')
export class InverterController extends Controller {
    @Get('data')
    public data() {
        return coordinatorService.inverterControllerData();
    }
}
