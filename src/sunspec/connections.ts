import type { Config } from '../helpers/config.js';
import { InverterSunSpecConnection } from './connection/inverter.js';
import { MeterSunSpecConnection } from './connection/meter.js';

function getConnectionKey({
    ip,
    port,
    unitId,
}: {
    ip: string;
    port: number;
    unitId: number;
}) {
    return `${ip}:${port}:${unitId}`;
}

const inverterConnectionsMap = new Map<string, InverterSunSpecConnection>();

export function getSunSpecInvertersConnection({
    ip,
    port,
    unitId,
}: Extract<Config['inverters'][number], { type: 'sunspec' }>) {
    const key = getConnectionKey({ ip, port, unitId });

    if (inverterConnectionsMap.has(key)) {
        return inverterConnectionsMap.get(key)!;
    }

    const connection = new InverterSunSpecConnection({ ip, port, unitId });

    inverterConnectionsMap.set(key, connection);

    return connection;
}

const meterConnectionsMap = new Map<string, MeterSunSpecConnection>();

export function getSunSpecMeterConnection({
    ip,
    port,
    unitId,
}: Extract<Config['meter'], { type: 'sunspec' }>) {
    const key = getConnectionKey({ ip, port, unitId });

    if (meterConnectionsMap.has(key)) {
        return meterConnectionsMap.get(key)!;
    }

    const connection = new MeterSunSpecConnection({ ip, port, unitId });

    meterConnectionsMap.set(key, connection);

    return connection;
}
