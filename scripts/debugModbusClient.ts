import 'dotenv/config';
import { getConfig } from '../src/config';
import { ModbusClient } from '../src/sunspec/modbusClient';
import { getBrandByCommonBlock } from '../src/sunspec/models/brand';

const config = getConfig();

void (async () => {
    const modbusClients = config.sunspecModbus.map(
        ({ ip, port, unitId }) => new ModbusClient(ip, port, unitId),
    );

    const clientsData = await Promise.all(
        modbusClients.map(async (client) => {
            const common = await client.getCommonBlock();

            const brand = getBrandByCommonBlock(common);

            return {
                common,
                inverter: await client.getInverterBlock(brand),
            };
        }),
    );

    console.dir(clientsData);
})();
