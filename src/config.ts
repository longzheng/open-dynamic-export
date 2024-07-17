import { safeParseInt } from './number';

export function assertEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Environment variable ${name} is required`);
    }
    return value;
}

// parse the SUNSPEC_MODBUS_HOSTS environment variable into a config object array
export function parseSunspecModbusHosts(
    value: string,
): { ip: string; port: number; id: number }[] {
    const hosts = value.split(',');

    return hosts.map((host) => {
        const [ip, port, id] = host.split(':');

        if (!ip || !port || !id) {
            throw new Error(
                `SUNSPEC_MODBUS_HOSTS must be in the format IP:PORT:ID, the value "${host}" is invalid.`,
            );
        }

        return {
            ip,
            port: safeParseInt(port),
            id: safeParseInt(id),
        };
    });
}
