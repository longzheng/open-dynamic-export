import mqtt from 'mqtt';
import { type Config } from '../../helpers/config.js';
import { type ActiveInverterControlLimit } from './inverterController.js';

export class Publish {
    private mqtt: { client: mqtt.MqttClient; topic: string } | undefined;

    constructor({ config }: { config: Pick<Config, 'publish'> }) {
        if (config.publish?.mqtt) {
            this.mqtt = {
                client: mqtt.connect(config.publish.mqtt.host, {
                    username: config.publish.mqtt.username,
                    password: config.publish.mqtt.password,
                }),
                topic: config.publish.mqtt.topic,
            };
        }
    }

    onActiveInverterControlLimit({
        limit,
    }: {
        limit: ActiveInverterControlLimit;
    }) {
        if (this.mqtt) {
            this.mqtt.client.publish(this.mqtt.topic, JSON.stringify(limit));
        }
    }
}
