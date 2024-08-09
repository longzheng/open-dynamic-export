import 'dotenv/config';
import { getConfig } from '../src/config';
import { InverterSunSpecConnection } from '../src/sunspec/connection/inverter';
import { logger } from '../src/logger';
import { MeterSunSpecConnection } from '../src/sunspec/connection/meter';

// This debugging script dumps all the SunSpec models
// It polls the inverters and smart meters once
// It logs all the SunSpec models to the console

const config = getConfig();

void (async () => {
    const invertersConnections = config.sunSpec.inverters.map(
        ({ ip, port, unitId }) =>
            new InverterSunSpecConnection({ ip, port, unitId }),
    );

    const metersConnections = config.sunSpec.meters.map(
        ({ ip, port, unitId }) =>
            new MeterSunSpecConnection({ ip, port, unitId }),
    );

    for (const inverterConnection of invertersConnections) {
        const inverterLogger = logger.child({
            ip: inverterConnection.ip,
            port: inverterConnection.port,
            unitId: inverterConnection.unitId,
        });

        let currentAddress = 40002;

        for (;;) {
            await inverterConnection.connect();

            const response =
                await inverterConnection.client.readHoldingRegisters(
                    currentAddress,
                    2,
                );
            const modelId = response.data[0]!;
            const modelLength = response.data[1]!;

            if (modelId === 0xffff && modelLength === 0) {
                inverterLogger.info('End of model list');
                break;
            }

            inverterLogger.info(
                `Model ID: ${modelId} at Address: ${currentAddress}, length ${modelLength}`,
            );

            // Move to the next model's address
            currentAddress += modelLength + 2; // +2 accounts for model ID and length fields
        }
    }

    for (const meterConnection of metersConnections) {
        const meterLogger = logger.child({
            ip: meterConnection.ip,
            port: meterConnection.port,
            unitId: meterConnection.unitId,
        });

        let currentAddress = 40002;

        for (;;) {
            await meterConnection.connect();

            const response = await meterConnection.client.readHoldingRegisters(
                currentAddress,
                2,
            );
            const modelId = response.data[0]!;
            const modelLength = response.data[1]!;

            if (modelId === 0xffff && modelLength === 0) {
                meterLogger.info('End of model list');
                break;
            }

            meterLogger.info(
                `Model ID: ${modelId} at Address: ${currentAddress}, length ${modelLength}`,
            );

            // Move to the next model's address
            currentAddress += modelLength + 2; // +2 accounts for model ID and length fields
        }
    }
})();
