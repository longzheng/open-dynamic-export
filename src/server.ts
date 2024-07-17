import 'dotenv/config';
import { SEP2Client } from './sep2Client';
import { assertEnv, parseSunspecModbusHosts } from './config';
import { safeParseInt } from './number';
import { ModbusClient } from './modbusClient';

const sep2Host = assertEnv('SEP2_HOST');
const sep2DcapUri = assertEnv('SEP2_DCAP_URI');
const sep2CertPath = assertEnv('SEP2_CERT_PATH');
const sep2KeyPath = assertEnv('SEP2_KEY_PATH');
const sep2Pen = safeParseInt(assertEnv('SEP2_PEN'));
const modbusHosts = parseSunspecModbusHosts(assertEnv('MODBUS_HOST'));

async function main() {
    const sep2Client = new SEP2Client({
        host: sep2Host,
        dcapUri: sep2DcapUri,
        certPath: sep2CertPath,
        keyPath: sep2KeyPath,
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
