import ModbusRTU from 'modbus-serial';
import { logger as pinoLogger } from '../../helpers/logger.js';
import type { Logger } from 'pino';

const connectionTimeoutMs = 10_000;

export abstract class ModbusConnection {
    public readonly client: ModbusRTU.default;
    public readonly ip: string;
    public readonly port: number;
    public readonly unitId: number;
    public readonly logger: Logger;

    private state:
        | { type: 'connected' }
        | { type: 'connecting'; connectPromise: Promise<void> }
        | { type: 'disconnected' } = { type: 'disconnected' };

    constructor({
        ip,
        port,
        unitId,
    }: {
        ip: string;
        port: number;
        unitId: number;
    }) {
        this.client = new ModbusRTU.default();
        this.ip = ip;
        this.port = port;
        this.unitId = unitId;
        this.logger = pinoLogger.child({
            module: 'ModbusConnection',
            ip,
            port,
            unitId,
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

                        await this.client.connectTCP(this.ip, {
                            port: this.port,
                            // timeout for connection
                            timeout: connectionTimeoutMs,
                        });

                        this.client.setID(this.unitId);

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
