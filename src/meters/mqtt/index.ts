import mqtt from 'mqtt';
import type { Config } from '../../helpers/config.js';
import type { z } from 'zod';
import { SiteMonitoringPollerBase } from '../../coordinator/helpers/siteMonitoringPollerBase.js';
import type { SiteMonitoringSampleData } from '../../coordinator/helpers/siteMonitoringSample.js';
import { siteMonitoringSampleDataSchema } from '../../coordinator/helpers/siteMonitoringSample.js';

export class MqttSiteMonitoringPoller extends SiteMonitoringPollerBase {
    private client: mqtt.MqttClient;
    private cachedMessage: z.infer<
        typeof siteMonitoringSampleDataSchema
    > | null = null;

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

            const result = siteMonitoringSampleDataSchema.safeParse(
                JSON.parse(data),
            );

            if (!result.success) {
                this.logger.error({ message: 'Invalid MQTT message', data });
                return;
            }

            this.cachedMessage = result.data;
        });

        void this.startPolling();
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    override async getSiteMonitoringSampleData(): Promise<SiteMonitoringSampleData | null> {
        return this.cachedMessage;
    }

    override onDestroy() {
        this.client.end();
    }
}
