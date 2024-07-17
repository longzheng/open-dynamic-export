import { SEP2Client } from './sep2Client';

const host = 'https://sep2-server.com';
const dcapUri = '/dcap';
const certPath = 'path/to/cert.pem';
const keyPath = 'path/to/key.pem';
const pen = 12345;
const modbusHost = '192.168.1.100';
const modbusPort = 502;

async function main() {
    const sep2Client = new SEP2Client(
        host,
        dcapUri,
        certPath,
        keyPath,
        pen,
        modbusHost,
        modbusPort,
    );
    await sep2Client.initialize();

    // Set an interval to handle DER control periodically
    setInterval(async () => {
        try {
            await sep2Client.handleDERControl();
        } catch (error) {
            console.error('Error handling DER control:', error);
        }
    }, 60000); // Adjust interval as needed
}

main().catch((error) => console.error('Error starting SEP2 client:', error));
