import mqtt from 'mqtt';
import { type Config } from '../../helpers/config.js';
import { type ActiveInverterControlLimit } from './inverterController.js';

export class ActiveLimitOutput {
    private mqttClient: mqtt.MqttClient | undefined;

    constructor({ config }: { config: Config }) {
        if (config.outputActiveLimits?.mqtt) {
            this.mqttClient = mqtt.connect(
                config.outputActiveLimits.mqtt.host,
                {
                    username: config.outputActiveLimits.mqtt.username,
                    password: config.outputActiveLimits.mqtt.password,
                },
            );
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
