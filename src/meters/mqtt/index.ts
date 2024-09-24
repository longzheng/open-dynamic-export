import mqtt from 'mqtt';
import type { Config } from '../../helpers/config.js';
import type { z } from 'zod';
import { SiteSamplePollerBase } from '../siteSamplePollerBase.js';
import type { SiteSampleData } from '../siteSample.js';
import { siteSampleDataSchema } from '../siteSample.js';
import type { Result } from '../../helpers/result.js';

export class MqttSiteSamplePoller extends SiteSamplePollerBase {
    private client: mqtt.MqttClient;
    private cachedMessage: z.infer<typeof siteSampleDataSchema> | null = null;

    constructor({
        mqttConfig,
    }: {
        mqttConfig: Extract<Config['meter'], { type: 'mqtt' }>;
    }) {
        super({
            name: 'mqtt',
            pollingIntervalMs: 200,
        });

        this.client = mqtt.connect(`mqtt://${mqttConfig.host}`, {
            username: mqttConfig.username,
            password: mqttConfig.password,
        });

        this.client.on('connect', () => {
            this.client.subscribe(mqttConfig.topic);
        });

        this.client.on('message', (_topic, message) => {
            const data = message.toString();

            const result = siteSampleDataSchema.safeParse(JSON.parse(data));

            if (!result.success) {
                this.logger.error({ message: 'Invalid MQTT message', data });
                return;
            }

            this.cachedMessage = result.data;
        });

        void this.startPolling();
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    override async getSiteSampleData(): Promise<Result<SiteSampleData>> {
        if (!this.cachedMessage) {
            return {
                success: false,
                error: new Error('No site sample data on MQTT'),
            };
        }

        return { success: true, value: this.cachedMessage };
    }

    override onDestroy() {
        this.client.end();
    }
}
