import type { Config } from '../helpers/config.js';
import { InverterSunSpecConnection } from './connection/inverter.js';
import { MeterSunSpecConnection } from './connection/meter.js';

export function getSunSpecInvertersConnections(config: Config) {
    return config.inverters.map(
        ({ ip, port, unitId }) =>
            new InverterSunSpecConnection({ ip, port, unitId }),
    );
}

export function getSunSpecMeterConnection(
    meterConfig: Extract<Config['meter'], { type: 'sunspec' }>,
) {
    return new MeterSunSpecConnection({
        ip: meterConfig.ip,
        port: meterConfig.port,
        unitId: meterConfig.unitId,
    });
}
