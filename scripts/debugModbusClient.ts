import 'dotenv/config';
import { getConfig } from '../src/config';
import { ModbusClient } from '../src/sunspec/modbusClient';

const config = getConfig();

void (async () => {
    const modbusClients = config.sunspecModbus.map(
        ({ ip, port, unitId }) => new ModbusClient(ip, port, unitId),
    );

    const commonBlock = await Promise.all(
        modbusClients.map((client) => client.getCommonBlock()),
    );

    console.dir(commonBlock);
})();
