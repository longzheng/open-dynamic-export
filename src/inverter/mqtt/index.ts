import {
    type InverterDataBase,
    inverterDataSchema,
    type InverterData,
} from '../inverterData.js';
import { InverterDataPollerBase } from '../inverterDataPollerBase.js';
import { type Config } from '../../helpers/config.js';
import mqtt from 'mqtt';

export class MqttInverterDataPoller extends InverterDataPollerBase {
    private client: mqtt.MqttClient;
    private cachedMessage: InverterDataBase | null = null;

    constructor({
        mqttConfig,
        inverterIndex,
        applyControl,
    }: {
        mqttConfig: Extract<Config['inverters'][number], { type: 'mqtt' }>;
        inverterIndex: number;
        applyControl: boolean;
    }) {
        super({
            name: 'MqttInverterDataPoller',
            pollingIntervalMs: mqttConfig.pollingIntervalMs,
            applyControl,
            inverterIndex,
        });

        this.client = mqtt.connect(mqttConfig.host, {
            username: mqttConfig.username,
            password: mqttConfig.password,
        });

        this.client.on('connect', () => {
            this.client.subscribe(mqttConfig.topic);
        });

        this.client.on('message', (_topic, message) => {
            const data = message.toString();

            const result = inverterDataSchema.safeParse(JSON.parse(data));

            if (!result.success) {
                this.logger.error({
                    message: `Invalid MQTT message. Error: ${result.error.message}`,
                    data,
                });
                return;
            }

            this.cachedMessage = result.data;
        });

        void this.startPolling();
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    override async getInverterData(): Promise<InverterData> {
        if (!this.cachedMessage) {
            throw new Error('No inverter data on MQTT');
        }

        return { date: new Date(), ...this.cachedMessage };
    }

    override onDestroy(): void {
        this.client.end();
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    override async onControl(): Promise<void> {
        if (this.applyControl) {
            throw new Error('Unable to control MQTT inverter');
        }
    }
}
