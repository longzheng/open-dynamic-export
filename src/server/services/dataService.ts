import {
    queryConnection,
    queryEnergize,
    queryExportLimit,
    queryGenerationLimit,
    queryRealPowerSite,
    queryDERRealPower,
    queryLoadRealPower,
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

export function getConnection() {
    return queryConnection();
}

export function getEnergize() {
    return queryEnergize();
}
