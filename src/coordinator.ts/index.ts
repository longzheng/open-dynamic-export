import 'dotenv/config';
import { defaultIntervalSeconds, SEP2Client } from '../sep2/client';
import { getConfig, getConfigSep2CertKey } from '../config';
import { getSunSpecConnections } from '../sunspec/connections';

const config = getConfig();
const { sep2Cert, sep2Key } = getConfigSep2CertKey(config);
const { invertersConnections, metersConnections } =
    getSunSpecConnections(config);

async function main() {
    const sep2Client = new SEP2Client({
        sep2Config: config.sep2,
        cert: sep2Cert,
        key: sep2Key,
    });

    console.log('Discovering SEP2');

    await sep2Client.discovery().then(() => {
        // poll at default interval
        setInterval(() => {
            void sep2Client.discovery();
        }, defaultIntervalSeconds.DeviceCapability * 1000);
    });
}

main().catch((error) => console.error('Error starting SEP2 client:', error));
