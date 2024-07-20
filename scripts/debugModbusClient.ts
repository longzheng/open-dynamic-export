import 'dotenv/config';
import { getConfig } from '../src/config';
import { ModbusClient } from '../src/sunspec/modbusClient';

const config = getConfig();

void (async () => {
    const modbusClients = config.sunspecModbus.map(
        ({ ip, port, unitId }) => new ModbusClient(ip, port, unitId),
    );

    const clientsData = await Promise.all(
        modbusClients.map(async (client) => {
            return {
                common: await client.getCommonBlock(),
                inverter: await client.getFroniusInverterBlock(),
            };
        }),
    );

    console.dir(clientsData);
})();
