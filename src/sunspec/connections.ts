import type { Config } from '../config';
import { InverterSunSpecConnection } from './connection/inverter';
import { MeterSunSpecConnection } from './connection/meter';

export function getSunSpecConnections(config: Config) {
    const invertersConnections = config.sunSpec.inverters.map(
        ({ ip, port, unitId }) =>
            new InverterSunSpecConnection({ ip, port, unitId }),
    );

    const metersConnections = config.sunSpec.meters.map(
        ({ ip, port, unitId }) =>
            new MeterSunSpecConnection({ ip, port, unitId }),
    );

    return {
        invertersConnections,
        metersConnections,
    };
}
