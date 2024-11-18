import mqtt from 'mqtt';
import { type Config } from '../../helpers/config.js';
import { SiteSamplePollerBase } from '../siteSamplePollerBase.js';
import { type SiteSample } from '../siteSample.js';
import { siteSampleDataSchema } from '../siteSample.js';

export class MqttSiteSamplePoller extends SiteSamplePollerBase {
    private client: mqtt.MqttClient;
    private cachedMessage: SiteSample | null = null;

    constructor({
        mqttConfig,
    }: {
        mqttConfig: Extract<Config['meter'], { type: 'mqtt' }>;
    }) {
        super({
            name: 'mqtt',
            pollingIntervalMs: 200,
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

            const result = siteSampleDataSchema.safeParse(JSON.parse(data));

            if (!result.success) {
                this.logger.error({ message: 'Invalid MQTT message', data });
                return;
            }

            this.cachedMessage = { date: new Date(), ...result.data };
        });

        void this.startPolling();
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    override async getSiteSample(): Promise<SiteSample> {
        if (!this.cachedMessage) {
            throw new Error('No site sample data on MQTT');
        }

        return this.cachedMessage;
    }

    override onDestroy() {
        this.client.end();
    }
}
