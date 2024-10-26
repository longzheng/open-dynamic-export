import 'dotenv/config';
import { getConfig } from '../src/helpers/config.js';
import { logger } from '../src/helpers/logger.js';
import { getModbusConnection } from '../src/modbus/connections.js';

// This debugging script dumps all the SunSpec models
// It polls the inverters and smart meters once
// It logs all the SunSpec models to the console

const config = getConfig();

void (async () => {
    const inverters = config.inverters
        .filter((inverter) => inverter.type === 'sunspec')
        .map((inverter) => ({
            config: inverter,
            connection: getModbusConnection(inverter.connection),
        }));

    for (const inverter of inverters) {
        const inverterLogger = logger.child({
            config: inverter.config,
        });

        let currentAddress = 40002;

        for (;;) {
            await inverter.connection.connect();

            const response = await inverter.connection.readRegisters({
                type: 'holding',
                unitId: inverter.config.unitId,
                start: currentAddress,
                length: 2,
            });
            const modelId = response.data[0]!;
            const modelLength = response.data[1]!;

            if (modelId === 0xffff && modelLength === 0) {
                inverterLogger.info('End of model list');
                break;
            }

            inverterLogger.info(
                { modelId, currentAddress, modelLength },
                `Found inverter model`,
            );

            // Move to the next model's address
            currentAddress += modelLength + 2; // +2 accounts for model ID and length fields
        }
    }

    if (config.meter.type === 'sunspec') {
        const meterConnection = getModbusConnection(config.meter.connection);

        const meterLogger = logger.child({
            config: meterConnection.config,
        });

        let currentAddress = 40002;

        for (;;) {
            await meterConnection.connect();

            const response = await meterConnection.readRegisters({
                type: 'holding',
                unitId: config.meter.unitId,
                start: currentAddress,
                length: 2,
            });
            const modelId = response.data[0]!;
            const modelLength = response.data[1]!;

            if (modelId === 0xffff && modelLength === 0) {
                meterLogger.info('End of model list');
                break;
            }

            meterLogger.info(
                { modelId, currentAddress, modelLength },
                `Found meter model`,
            );

            // Move to the next model's address
            currentAddress += modelLength + 2; // +2 accounts for model ID and length fields
        }
    }

    process.exit();
})();
