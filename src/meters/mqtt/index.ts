import mqtt from 'mqtt';
import type { Config } from '../../helpers/config.js';
import type { z } from 'zod';
import { SiteSamplePollerBase } from '../siteSamplePollerBase.js';
import type { SiteSampleData } from '../siteSample.js';
import { siteSampleDataSchema } from '../siteSample.js';

export class MqttSiteSamplePoller extends SiteSamplePollerBase {
    private client: mqtt.MqttClient;
    private cachedMessage: z.infer<typeof siteSampleDataSchema> | null = null;

    constructor({
        config,
    }: {
        config: Extract<Config['meter'], { type: 'mqtt' }>;
    }) {
        super({
            meterName: 'mqtt',
            pollingIntervalMs: 200,
        });

        this.client = mqtt.connect(`mqtt://${config.host}`, {
            username: config.username,
            password: config.password,
        });

        this.client.on('connect', () => {
            this.client.subscribe(config.topic);
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
    override async getSiteSampleData(): Promise<SiteSampleData | null> {
        return this.cachedMessage;
    }

    override onDestroy() {
        this.client.end();
    }
}
