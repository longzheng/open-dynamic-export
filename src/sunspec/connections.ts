import type { Config } from '../helpers/config.js';
import { getModbusConnectionKey } from '../modbus/connections.js';
import { InverterSunSpecConnection } from './connection/inverter.js';
import { MeterSunSpecConnection } from './connection/meter.js';

const inverterConnectionsMap = new Map<string, InverterSunSpecConnection>();

export function getSunSpecInvertersConnection({
    connection,
    unitId,
}: Extract<Config['inverters'][number], { type: 'sunspec' }>) {
    const key = getModbusConnectionKey({ connection, unitId });

    if (inverterConnectionsMap.has(key)) {
        return inverterConnectionsMap.get(key)!;
    }

    const inverterSunspecConnection = new InverterSunSpecConnection({
        connection,
        unitId,
    });

    inverterConnectionsMap.set(key, inverterSunspecConnection);

    return inverterSunspecConnection;
}

const meterConnectionsMap = new Map<string, MeterSunSpecConnection>();

export function getSunSpecMeterConnection({
    connection,
    unitId,
}: Extract<Config['meter'], { type: 'sunspec' }>) {
    const key = getModbusConnectionKey({ connection, unitId });

    if (meterConnectionsMap.has(key)) {
        return meterConnectionsMap.get(key)!;
    }

    const meterSunSpecconnection = new MeterSunSpecConnection({
        connection,
        unitId,
    });

    meterConnectionsMap.set(key, meterSunSpecconnection);

    return meterSunSpecconnection;
}
