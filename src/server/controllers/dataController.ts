import { Controller, Get, OperationId, Route, Tags } from 'tsoa';
import {
    getConnection,
    getDERRealPower,
    getEnergize,
    getExportLimit,
    getGenerationLimit,
    getImportLimit,
    getLoadLimit,
    getLoadRealPower,
    getRealPowerSite,
} from '../services/dataService.js';

@Tags('data')
@Route('api/data')
export class DataController extends Controller {
    @Get('siteRealPower')
    @OperationId('siteRealPower')
    public siteRealPower() {
        return getRealPowerSite();
    }

    @Get('derRealPower')
    @OperationId('derRealPower')
    public derRealPower() {
        return getDERRealPower();
    }

    @Get('loadRealPower')
    @OperationId('loadRealPower')
    public loadRealPower() {
        return getLoadRealPower();
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

    @Get('importLimit')
    @OperationId('importLimit')
    public importLimit() {
        return getImportLimit();
    }

    @Get('loadLimit')
    @OperationId('loadLimit')
    public loadLimit() {
        return getLoadLimit();
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
