import type { Config } from '../helpers/config.js';
import { InverterSunSpecConnection } from './connection/inverter.js';
import { MeterSunSpecConnection } from './connection/meter.js';

function getInverterConnectionKey({
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

export function getSunSpecInvertersConnections(config: Config) {
    return config.inverters.map(({ ip, port, unitId }) => {
        const key = getInverterConnectionKey({ ip, port, unitId });

        if (inverterConnectionsMap.has(key)) {
            return inverterConnectionsMap.get(key)!;
        }

        const connection = new InverterSunSpecConnection({ ip, port, unitId });

        inverterConnectionsMap.set(key, connection);

        return connection;
    });
}

let meterConnectionCache: MeterSunSpecConnection | null = null;

export function getSunSpecMeterConnection(
    meterConfig: Extract<Config['meter'], { type: 'sunspec' }>,
) {
    if (meterConnectionCache) {
        return meterConnectionCache;
    }

    const meterConnection = new MeterSunSpecConnection({
        ip: meterConfig.ip,
        port: meterConfig.port,
        unitId: meterConfig.unitId,
    });

    meterConnectionCache = meterConnection;

    return meterConnection;
}
