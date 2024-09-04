import type { Config } from '../helpers/config';
import { InverterSunSpecConnection } from './connection/inverter';
import { MeterSunSpecConnection } from './connection/meter';

export function getSunSpecInvertersConnections(config: Config) {
    return config.inverters.map(
        ({ ip, port, unitId }) =>
            new InverterSunSpecConnection({ ip, port, unitId }),
    );
}

export function getSunSpecMeterConnection(config: Config) {
    switch (config.meter.type) {
        case 'sunspec':
            return new MeterSunSpecConnection({
                ip: config.meter.ip,
                port: config.meter.port,
                unitId: config.meter.unitId,
            });
    }
}
