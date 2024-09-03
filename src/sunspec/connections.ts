import type { Config } from '../helpers/config';
import { InverterSunSpecConnection } from './connection/inverter';
import { MeterSunSpecConnection } from './connection/meter';

export function getSunSpecInvertersConnections(config: Config) {
    return config.sunSpec.inverters.map(
        ({ ip, port, unitId }) =>
            new InverterSunSpecConnection({ ip, port, unitId }),
    );
}

export function getSunSpecMetersConnections(config: Config) {
    return (
        config.meters
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            .filter((meter) => meter.type === 'sunspec')
            .map(
                ({ ip, port, unitId }) =>
                    new MeterSunSpecConnection({ ip, port, unitId }),
            )
    );
}
