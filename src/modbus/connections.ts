import type { ModbusSchema } from '../helpers/config.js';
import { GrowattConnection } from './connection/growatt.js';
import { SmaConnection } from './connection/sma.js';

export function getModbusConnectionKey({
    connection,
    unitId,
}: ModbusSchema): string {
    switch (connection.type) {
        case 'tcp':
            return `${connection.ip}:${connection.port}:${unitId}`;
        case 'rtu':
            return `${connection.path}:${unitId}`;
    }
}

const smaConnectionsMap = new Map<string, SmaConnection>();

export function getSmaConnection({
    connection,
    unitId,
}: ModbusSchema): SmaConnection {
    const key = getModbusConnectionKey({ connection, unitId });

    if (smaConnectionsMap.has(key)) {
        return smaConnectionsMap.get(key)!;
    }

    const smaConnection = new SmaConnection({ connection, unitId });

    smaConnectionsMap.set(key, smaConnection);

    return smaConnection;
}

const growattConnectionsMap = new Map<string, GrowattConnection>();

export function getGrowattConnection({
    connection,
    unitId,
}: ModbusSchema): GrowattConnection {
    const key = getModbusConnectionKey({ connection, unitId });

    if (growattConnectionsMap.has(key)) {
        return growattConnectionsMap.get(key)!;
    }

    const growattConnection = new GrowattConnection({ connection, unitId });

    growattConnectionsMap.set(key, growattConnection);

    return growattConnection;
}
