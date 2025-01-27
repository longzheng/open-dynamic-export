import mqtt from 'mqtt';
import { type InverterControlLimit } from '../../coordinator/helpers/inverterController.js';
import { type LimiterType } from '../limiter.js';
import { type Config } from '../../helpers/config.js';
import { writeControlLimit } from '../../helpers/influxdb.js';
import { z } from 'zod';
import { type Logger } from 'pino';
import { pinoLogger } from '../../helpers/logger.js';

type MqttLimiterConfig = NonNullable<Config['limiters']['mqtt']>;

export class MqttLimiter implements LimiterType {
    private client: mqtt.MqttClient;
    private cachedMessage: z.infer<typeof mqttSchema> | null = null;
    private logger: Logger;

    constructor({ config }: { config: MqttLimiterConfig }) {
        this.logger = pinoLogger.child({ module: 'MqttLimiter' });

        this.client = mqtt.connect(config.host, {
            username: config.username,
            password: config.password,
        });

        this.client.on('connect', () => {
            this.client.subscribe(config.topic);
        });

        this.client.on('message', (_topic, message) => {
            const data = message.toString();

            const result = mqttSchema.safeParse(JSON.parse(data));

            if (!result.success) {
                this.logger.error({ message: 'Invalid MQTT message', data });
                return;
            }

            this.cachedMessage = result.data;
        });
    }

    getInverterControlLimit(): InverterControlLimit {
        const limit: InverterControlLimit = {
            source: 'mqtt',
            opModConnect: this.cachedMessage?.opModConnect,
            opModEnergize: this.cachedMessage?.opModEnergize,
            opModExpLimW: this.cachedMessage?.opModExpLimW,
            opModGenLimW: this.cachedMessage?.opModGenLimW,
            opModImpLimW: this.cachedMessage?.opModImpLimW,
            opModLoadLimW: this.cachedMessage?.opModLoadLimW,
        };

        writeControlLimit({ limit });

        return limit;
    }

    destroy(): void {
        this.client.end();
    }
}

const mqttSchema = z.object({
    opModConnect: z.boolean().optional(),
    opModEnergize: z.boolean().optional(),
    opModExpLimW: z.number().optional(),
    opModGenLimW: z.number().optional(),
    opModImpLimW: z.number().optional(),
    opModLoadLimW: z.number().optional(),
});
