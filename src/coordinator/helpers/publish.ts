import mqtt from 'mqtt';
import type { Config } from '../../helpers/configSchema.js';
import type { CsipAusControlSchedules } from '../../setpoints/csipAus/index.js';
import type {
    ActiveInverterControlLimit,
    InverterControlLimit,
} from './inverterController.js';

export class Publish {
    private mqtt:
        | {
              client: mqtt.MqttClient;
              activeInverterControlLimitTopic: string;
              csipAusTopic: string;
          }
        | undefined;

    constructor({ config }: { config: Pick<Config, 'publish'> }) {
        if (config.publish?.mqtt) {
            this.mqtt = {
                client: mqtt.connect(config.publish.mqtt.host, {
                    username: config.publish.mqtt.username,
                    password: config.publish.mqtt.password,
                }),
                activeInverterControlLimitTopic: config.publish.mqtt.topic,
                csipAusTopic:
                    config.publish.mqtt.csipAus ??
                    `${config.publish.mqtt.topic}/csipAus`,
            };
        }
    }

    onActiveInverterControlLimit({
        limit,
    }: {
        limit: ActiveInverterControlLimit;
    }) {
        if (this.mqtt) {
            const payload = JSON.stringify(limit);

            this.mqtt.client.publish(
                this.mqtt.activeInverterControlLimitTopic,
                payload,
            );
        }
    }

    onCsipAus({
        limit,
        setGradW,
        schedules,
    }: {
        limit: InverterControlLimit;
        setGradW: number;
        schedules: CsipAusControlSchedules;
    }) {
        if (this.mqtt) {
            const payload = JSON.stringify({
                limit,
                setGradW,
                schedules,
            });

            this.mqtt.client.publish(this.mqtt.csipAusTopic, payload);
        }
    }
}
