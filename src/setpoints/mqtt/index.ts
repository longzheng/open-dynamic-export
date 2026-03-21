import mqtt from 'mqtt';
import * as v from 'valibot';
import type { Logger } from 'pino';
import type { InverterControlLimit } from '../../coordinator/helpers/inverterController.js';
import type { SetpointType } from '../setpoint.js';
import type { Config } from '../../helpers/config.js';
import { writeControlLimit } from '../../helpers/influxdb.js';
import { pinoLogger } from '../../helpers/logger.js';

type MqttSetpointConfig = NonNullable<Config['setpoints']['mqtt']>;

export class MqttSetpoint implements SetpointType {
    private client: mqtt.MqttClient;
    private cachedMessage: v.InferOutput<typeof mqttSchema> | null = null;
    private lastMessageTime: number | null = null;
    private stalenessTimeoutMs: number | null;
    private logger: Logger;

    constructor({ config }: { config: MqttSetpointConfig }) {
        this.logger = pinoLogger.child({ module: 'MqttSetpoint' });
        this.stalenessTimeoutMs =
            config.stalenessTimeoutSeconds != null
                ? config.stalenessTimeoutSeconds * 1000
                : null;

        this.client = mqtt.connect(config.host, {
            username: config.username,
            password: config.password,
        });

        this.client.on('connect', () => {
            this.client.subscribe(config.topic);
        });

        this.client.on('message', (_topic, message) => {
            const data = message.toString();

            const result = v.safeParse(mqttSchema, JSON.parse(data));

            if (!result.success) {
                this.logger.error({ message: 'Invalid MQTT message', data });
                return;
            }

            this.cachedMessage = result.output;
            this.lastMessageTime = Date.now();
        });
    }

    private isMessageStale(): boolean {
        if (this.stalenessTimeoutMs === null || this.lastMessageTime === null) {
            return false;
        }

        return Date.now() - this.lastMessageTime > this.stalenessTimeoutMs;
    }

    getInverterControlLimit(): InverterControlLimit {
        const message = this.isMessageStale() ? null : this.cachedMessage;

        if (this.isMessageStale() && this.cachedMessage !== null) {
            this.logger.warn(
                'MQTT setpoint message is stale (no message received within timeout), falling back to fixed setpoints',
            );
        }

        const limit: InverterControlLimit = {
            source: 'mqtt',
            opModConnect: message?.opModConnect,
            opModEnergize: message?.opModEnergize,
            opModExpLimW: message?.opModExpLimW,
            opModGenLimW: message?.opModGenLimW,
            opModImpLimW: message?.opModImpLimW,
            opModLoadLimW: message?.opModLoadLimW,
            batteryChargeRatePercent: message?.batteryChargeRatePercent,
            batteryDischargeRatePercent: message?.batteryDischargeRatePercent,
            batteryStorageMode: message?.batteryStorageMode,
            batteryTargetSocPercent: message?.batteryTargetSocPercent,
            batteryImportTargetWatts: message?.batteryImportTargetWatts,
            batteryExportTargetWatts: message?.batteryExportTargetWatts,
            batterySocMinPercent: message?.batterySocMinPercent,
            batterySocMaxPercent: message?.batterySocMaxPercent,
            batteryChargeMaxWatts: message?.batteryChargeMaxWatts,
            batteryDischargeMaxWatts: message?.batteryDischargeMaxWatts,
            batteryPriorityMode: message?.batteryPriorityMode,
            batteryGridChargingEnabled: message?.batteryGridChargingEnabled,
            batteryGridChargingMaxWatts: message?.batteryGridChargingMaxWatts,
        };

        writeControlLimit({ limit });

        return limit;
    }

    destroy(): void {
        this.client.end();
    }
}

const mqttSchema = v.object({
    opModConnect: v.optional(v.boolean()),
    opModEnergize: v.optional(v.boolean()),
    opModExpLimW: v.optional(v.number()),
    opModGenLimW: v.optional(v.number()),
    opModImpLimW: v.optional(v.number()),
    opModLoadLimW: v.optional(v.number()),
    batteryChargeRatePercent: v.optional(v.number()),
    batteryDischargeRatePercent: v.optional(v.number()),
    batteryStorageMode: v.optional(v.number()),
    batteryTargetSocPercent: v.optional(v.number()),
    batteryImportTargetWatts: v.optional(v.number()),
    batteryExportTargetWatts: v.optional(v.number()),
    batterySocMinPercent: v.optional(v.number()),
    batterySocMaxPercent: v.optional(v.number()),
    batteryChargeMaxWatts: v.optional(v.number()),
    batteryDischargeMaxWatts: v.optional(v.number()),
    batteryPriorityMode: v.optional(
        v.picklist(['export_first', 'battery_first']),
    ),
    batteryGridChargingEnabled: v.optional(v.boolean()),
    batteryGridChargingMaxWatts: v.optional(v.number()),
});
