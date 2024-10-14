import type { Config } from '../helpers/config.js';
import { SmaConnection } from './connection/sma.js';

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

const smaConnectionsMap = new Map<string, SmaConnection>();

export function getSmaConnection({
    ip,
    port,
    unitId,
}: Extract<Config['inverters'][number], { type: 'sma' }>) {
    const key = getConnectionKey({ ip, port, unitId });

    if (smaConnectionsMap.has(key)) {
        return smaConnectionsMap.get(key)!;
    }

    const connection = new SmaConnection({ ip, port, unitId });

    smaConnectionsMap.set(key, connection);

    return connection;
}
