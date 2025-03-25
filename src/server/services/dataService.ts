import {
    queryConnection,
    queryEnergize,
    queryExportLimit,
    queryGenerationLimit,
    queryRealPowerSite,
    queryDERRealPower,
    queryLoadRealPower,
    queryImportLimit,
    queryLoadLimit,
} from '../../helpers/influxdb.js';

export function getRealPowerSite() {
    return queryRealPowerSite();
}

export function getDERRealPower() {
    return queryDERRealPower();
}

export function getLoadRealPower() {
    return queryLoadRealPower();
}

export function getExportLimit() {
    return queryExportLimit();
}

export function getGenerationLimit() {
    return queryGenerationLimit();
}

export function getImportLimit() {
    return queryImportLimit();
}

export function getLoadLimit() {
    return queryLoadLimit();
}

export function getConnection() {
    return queryConnection();
}

export function getEnergize() {
    return queryEnergize();
}
