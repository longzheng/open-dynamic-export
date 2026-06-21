import mqtt from 'mqtt';
import type { Config } from '../../helpers/configSchema.js';
import type { CsipAusControlSchedules } from '../../setpoints/csipAus/index.js';
import type { ActiveInverterControlLimit } from './inverterController.js';

export class Publish {
    private mqtt:
        | {
              client: mqtt.MqttClient;
              activeInverterControlLimitTopic: string;
              activeInverterControlLimitPayload: string | null;
              csipAusControlSchedulesTopic: string;
              csipAusControlSchedulesPayload: string | null;
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
                activeInverterControlLimitPayload: null,
                csipAusControlSchedulesTopic:
                    config.publish.mqtt.csipAusControlSchedules ??
                    `${config.publish.mqtt.topic}/csipAus/schedules`,
                csipAusControlSchedulesPayload: null,
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

            if (payload === this.mqtt.activeInverterControlLimitPayload) {
                return;
            }

            this.mqtt.client.publish(
                this.mqtt.activeInverterControlLimitTopic,
                payload,
                {
                    retain: true,
                },
            );
            this.mqtt.activeInverterControlLimitPayload = payload;
        }
    }

    onCsipAusControlSchedules({
        schedules,
    }: {
        schedules: CsipAusControlSchedules;
    }) {
        if (this.mqtt) {
            const payload = JSON.stringify(schedules);

            if (payload === this.mqtt.csipAusControlSchedulesPayload) {
                return;
            }

            this.mqtt.client.publish(
                this.mqtt.csipAusControlSchedulesTopic,
                payload,
                {
                    retain: true,
                },
            );
            this.mqtt.csipAusControlSchedulesPayload = payload;
        }
    }
}
