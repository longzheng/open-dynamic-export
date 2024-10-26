import type { ModbusSchema } from '../helpers/config.js';
import { ModbusConnection } from './connection/base.js';

export function getModbusConnectionKey(
    connection: ModbusSchema['connection'],
): string {
    switch (connection.type) {
        case 'tcp':
            return `${connection.ip}:${connection.port}`;
        case 'rtu':
            return `${connection.path}`;
    }
}

const modbusConnectionsMap = new Map<string, ModbusConnection>();

export function getModbusConnection(
    connection: ModbusSchema['connection'],
): ModbusConnection {
    const key = getModbusConnectionKey(connection);

    if (modbusConnectionsMap.has(key)) {
        return modbusConnectionsMap.get(key)!;
    }

    const modbusConnection = new ModbusConnection(connection);

    modbusConnectionsMap.set(key, modbusConnection);

    return modbusConnection;
}
