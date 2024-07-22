import 'dotenv/config';
import { SEP2Client } from './sep2/client';
import { getConfig } from './config';
import { ModbusConnection } from './sunspec/modbusConnection';
import { resolve } from 'path';
import { readFileSync } from 'node:fs';

const config = getConfig();

const sep2Cert = readFileSync(resolve(config.sep2.certPath), 'utf-8');

if (!sep2Cert) {
    throw new Error('Certificate is not found or is empty');
}

const sep2Key = readFileSync(resolve(config.sep2.keyPath), 'utf-8');

if (!sep2Key) {
    throw new Error('Key is not found or is empty');
}

async function main() {
    const sep2Client = new SEP2Client({
        sep2Config: config.sep2,
        cert: sep2Cert,
        key: sep2Key,
    });

    await sep2Client.initialize();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const modbusClients = config.sunspecModbus.map(
        ({ ip, port, unitId }) => new ModbusConnection({ ip, port, unitId }),
    );

    // // Set an interval to handle DER control periodically
    // setInterval(async () => {
    //     try {
    //         await sep2Client.handleDERControl();
    //     } catch (error) {
    //         console.error('Error handling DER control:', error);
    //     }
    // }, 60000); // Adjust interval as needed
}

main().catch((error) => console.error('Error starting SEP2 client:', error));
