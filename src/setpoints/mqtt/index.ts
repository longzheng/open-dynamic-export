import mqtt from 'mqtt';
import * as v from 'valibot';
import type { Logger } from 'pino';
import type { InverterControlLimit } from '../../coordinator/helpers/inverterController.js';
import type { SetpointType } from '../setpoint.js';
import type { Config } from '../../helpers/config.js';
import { writeControlLimit } from '../../helpers/influxdb.js';
import { pinoLogger } from '../../helpers/logger.js';

type MqttSetpointConfig = NonNullable<Config['setpoints']['mqtt']>;

export class MqttSetpoint implements SetpointType {
    private client: mqtt.MqttClient;
    private cachedMessage: v.InferOutput<typeof mqttSchema> | null = null;
    private logger: Logger;

    constructor({ config }: { config: MqttSetpointConfig }) {
        this.logger = pinoLogger.child({ module: 'MqttSetpoint' });

        this.client = mqtt.connect(config.host, {
            username: config.username,
            password: config.password,
        });

        this.client.on('connect', () => {
            this.client.subscribe(config.topic);
        });

        this.client.on('message', (_topic, message) => {
            const data = message.toString();

            const result = v.safeParse(mqttSchema, JSON.parse(data));

            if (!result.success) {
                this.logger.error({ message: 'Invalid MQTT message', data });
                return;
            }

            this.cachedMessage = result.output;
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

const mqttSchema = v.object({
    opModConnect: v.optional(v.boolean()),
    opModEnergize: v.optional(v.boolean()),
    opModExpLimW: v.optional(v.number()),
    opModGenLimW: v.optional(v.number()),
    opModImpLimW: v.optional(v.number()),
    opModLoadLimW: v.optional(v.number()),
});
