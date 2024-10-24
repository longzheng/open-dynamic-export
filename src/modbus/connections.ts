import type { Config, ModbusSchema } from '../helpers/config.js';
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
}: Extract<Config['inverters'][number], { type: 'sma' }>): SmaConnection {
    const key = getModbusConnectionKey({ connection, unitId });

    if (smaConnectionsMap.has(key)) {
        return smaConnectionsMap.get(key)!;
    }

    const smaConnection = new SmaConnection({ connection, unitId });

    smaConnectionsMap.set(key, smaConnection);

    return smaConnection;
}
