import mqtt from 'mqtt';
import type { Config } from '../../helpers/configSchema.js';
import type { CsipAusControlSchedules } from '../../setpoints/csipAus/index.js';
import type { ActiveInverterControlLimit } from './inverterController.js';

export class Publish {
    private mqtt:
        | {
              client: mqtt.MqttClient;
              activeInverterControlLimitTopic: string;
              csipAusControlSchedulesTopic: string;
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
                csipAusControlSchedulesTopic:
                    config.publish.mqtt.csipAusControlSchedules ??
                    `${config.publish.mqtt.topic}/csipAus/schedules`,
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

    onCsipAusControlSchedules({
        schedules,
    }: {
        schedules: CsipAusControlSchedules;
    }) {
        if (this.mqtt) {
            const payload = JSON.stringify(schedules);

            this.mqtt.client.publish(
                this.mqtt.csipAusControlSchedulesTopic,
                payload,
            );
        }
    }
}
