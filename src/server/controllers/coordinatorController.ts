import { Controller, Get, OperationId, Post, Route, Tags } from 'tsoa';
import { coordinatorService } from '../services/coordinatorService.js';

@Tags('coordinator')
@Route('coordinator')
export class CoordinatorController extends Controller {
    @Post('start')
    @OperationId('coordinatorStart')
    public start() {
        return coordinatorService.start();
    }

    @Get('status')
    @OperationId('coordinatorStatus')
    public status() {
        return coordinatorService.status();
    }

    @Post('stop')
    @OperationId('coordinatorStop')
    public stop() {
        return coordinatorService.stop();
    }
}
