import 'dotenv/config';
import { getConfig } from '../src/config';
import { ModbusConnection } from '../src/sunspec/modbusConnection';
import { getBrandByCommonModel } from '../src/sunspec/models/brand';

const config = getConfig();

void (async () => {
    const modbusConnections = config.sunspecModbus.map(
        ({ ip, port, unitId }) => new ModbusConnection({ ip, port, unitId }),
    );

    const clientsData = await Promise.all(
        modbusConnections.map(async (client) => {
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
