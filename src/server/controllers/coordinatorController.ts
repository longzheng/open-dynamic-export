import { Controller, Get, Post, Route } from 'tsoa';
import { coordinatorService } from '../services/coordinatorService.js';

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

    @Get('siteSample')
    public siteSample() {
        return coordinatorService.siteSample();
    }
}
