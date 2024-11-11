import { Powerwall2Client } from './client.js';

function getPowerwall2ClientKey({
    ip,
    password,
}: {
    ip: string;
    password: string;
}): string {
    return `${ip}:${password}`;
}

const powerwall2ClientMap = new Map<string, Powerwall2Client>();

export function getPowerwall2Client({
    ip,
    password,
    timeoutSeconds,
}: {
    ip: string;
    password: string;
    timeoutSeconds: number;
}): Powerwall2Client {
    const key = getPowerwall2ClientKey({ ip, password });

    if (powerwall2ClientMap.has(key)) {
        return powerwall2ClientMap.get(key)!;
    }

    const modbusConnection = new Powerwall2Client({
        ip,
        password,
        timeoutSeconds,
    });

    powerwall2ClientMap.set(key, modbusConnection);

    return modbusConnection;
}
