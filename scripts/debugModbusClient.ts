import 'dotenv/config';
import { getConfig } from '../src/config';
import { ModbusClient } from '../src/sunspec/modbusClient';
import { getBrandByCommonModel } from '../src/sunspec/models/brand';

const config = getConfig();

void (async () => {
    const modbusClients = config.sunspecModbus.map(
        ({ ip, port, unitId }) => new ModbusClient(ip, port, unitId),
    );

    const clientsData = await Promise.all(
        modbusClients.map(async (client) => {
            const common = await client.getCommonModel();

            const brand = getBrandByCommonModel(common);

            return {
                common,
                inverter: await client.getInverterModel(brand),
                nameplate: await client.getNameplateModel(brand),
                settings: await client.getSettingsModel(brand),
                status: await client.getStatusModel(brand),
                controls: await client.getControlsModel(brand),
            };
        }),
    );

    console.dir(clientsData);
})();
