import mqtt from 'mqtt';
import { type Config } from '../../helpers/config.js';
import { type ActiveInverterControlLimit } from './inverterController.js';

export class Publish {
    private mqttClient: mqtt.MqttClient | undefined;

    constructor({ config }: { config: Config }) {
        if (config.publish?.mqtt) {
            this.mqttClient = mqtt.connect(config.publish.mqtt.host, {
                username: config.publish.mqtt.username,
                password: config.publish.mqtt.password,
            });
        }
    }

    onActiveInverterControlLimit({
        limit,
    }: {
        limit: ActiveInverterControlLimit;
    }) {
        if (this.mqttClient) {
            this.mqttClient.publish(
                'inverterControlLimit',
                JSON.stringify(limit),
            );
        }
    }
}
