import 'dotenv/config';
import { SEP2Client } from './sep2Client';
import { assertEnv, parseSunspecModbusHosts } from './config';
import { safeParseIntString } from './number';
import { ModbusClient } from './modbusClient';
import { resolve } from 'path';
import { readFileSync } from 'node:fs';

const sep2Host = assertEnv('SEP2_HOST');
const sep2DcapUri = assertEnv('SEP2_DCAP_URI');
const sep2CertPath = assertEnv('SEP2_CERT_PATH');
const sep2KeyPath = assertEnv('SEP2_KEY_PATH');
const sep2Pen = safeParseIntString(assertEnv('SEP2_PEN'));
const modbusHosts = parseSunspecModbusHosts(assertEnv('MODBUS_HOST'));

const sep2Cert = readFileSync(resolve(sep2CertPath), 'utf-8');

if (!sep2Cert) {
    throw new Error('Certificate is not found or is empty');
}

const sep2Key = readFileSync(resolve(sep2KeyPath), 'utf-8');

if (!sep2Key) {
    throw new Error('Key is not found or is empty');
}

async function main() {
    const sep2Client = new SEP2Client({
        host: sep2Host,
        dcapUri: sep2DcapUri,
        cert: sep2Cert,
        key: sep2Key,
        pen: sep2Pen,
    });

    await sep2Client.initialize();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const modbusClients = modbusHosts.map(
        ({ ip, port, id }) => new ModbusClient(ip, port, id),
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
