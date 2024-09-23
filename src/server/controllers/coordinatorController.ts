import { Controller, Get, Post, Route, Tags } from 'tsoa';
import { coordinatorService } from '../services/coordinatorService.js';

@Tags('coordinator')
@Route('coordinator')
export class CoordinatorController extends Controller {
    @Post('start')
    public start() {
        return coordinatorService.start();
    }

    @Get('status')
    public status() {
        return coordinatorService.status();
    }

    @Post('stop')
    public stop() {
        return coordinatorService.stop();
    }
}
