import ModbusRTU from 'modbus-serial';
import { logger as pinoLogger } from '../../helpers/logger.js';
import type { Logger } from 'pino';
import type { ModbusSchema } from '../../helpers/config.js';

const connectionTimeoutMs = 10_000;

export abstract class ModbusConnection {
    public readonly client: ModbusRTU.default;
    public readonly config: ModbusSchema;
    public readonly logger: Logger;

    private state:
        | { type: 'connected' }
        | { type: 'connecting'; connectPromise: Promise<void> }
        | { type: 'disconnected' } = { type: 'disconnected' };

    constructor(config: ModbusSchema) {
        this.client = new ModbusRTU.default();
        this.config = config;
        this.logger = pinoLogger.child({
            module: 'ModbusConnection',
            config,
        });

        this.client.on('close', () => {
            this.state = { type: 'disconnected' };

            this.logger.error(`Modbus client closed`);
        });

        // This is never observed to be triggered
        this.client.on('error', (error) => {
            this.state = { type: 'disconnected' };

            this.logger.error(error, `Modbus client error`);
        });

        this.connect().catch(() => {
            // no op
        });
    }

    async connect() {
        switch (this.state.type) {
            case 'connected':
                return;
            case 'connecting':
                return this.state.connectPromise;
            case 'disconnected': {
                const connectPromise = (async () => {
                    try {
                        this.logger.info(`Modbus client connecting`);

                        switch (this.config.connection.type) {
                            case 'tcp':
                                await this.client.connectTCP(
                                    this.config.connection.ip,
                                    {
                                        port: this.config.connection.port,
                                        // timeout for connection
                                        timeout: connectionTimeoutMs,
                                    },
                                );
                                break;
                            case 'rtu':
                                await this.client.connectRTUBuffered(
                                    this.config.connection.path,
                                    {
                                        baudRate:
                                            this.config.connection.baudRate,
                                    },
                                );
                                break;
                        }

                        this.client.setID(this.config.unitId);

                        // timeout for requests
                        this.client.setTimeout(connectionTimeoutMs);

                        this.logger.info(`Modbus client connected`);

                        this.state = { type: 'connected' };
                    } catch (error) {
                        this.logger.error(
                            {
                                error,
                            },
                            `Modbus client error connecting`,
                        );

                        this.state = { type: 'disconnected' };

                        throw error;
                    }
                })();

                this.state = { type: 'connecting', connectPromise };

                return connectPromise;
            }
        }
    }
}
