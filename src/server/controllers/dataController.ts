import { Controller, Get, OperationId, Route, Tags } from 'tsoa';
import {
    getConnection,
    getEnergize,
    getExportLimit,
    getGenerationLimit,
    getRealPowerSite,
} from '../services/dataService.js';

@Tags('data')
@Route('data')
export class DataController extends Controller {
    @Get('siteRealPower')
    @OperationId('siteRealPower')
    public siteRealPower() {
        return getRealPowerSite();
    }

    @Get('exportLimit')
    @OperationId('exportLimit')
    public exportLimit() {
        return getExportLimit();
    }

    @Get('generationLimit')
    @OperationId('generationLimit')
    public generationLimit() {
        return getGenerationLimit();
    }

    @Get('connection')
    @OperationId('connection')
    public connection() {
        return getConnection();
    }

    @Get('energize')
    @OperationId('energize')
    public energize() {
        return getEnergize();
    }
}
