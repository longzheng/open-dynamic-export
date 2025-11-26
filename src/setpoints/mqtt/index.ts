import mqtt from 'mqtt';
import { type InverterControlLimit } from '../../coordinator/helpers/inverterController.js';
import { type SetpointType } from '../setpoint.js';
import { type Config } from '../../helpers/config.js';
import { writeControlLimit } from '../../helpers/influxdb.js';
import { z } from 'zod';
import { type Logger } from 'pino';
import { pinoLogger } from '../../helpers/logger.js';

type MqttSetpointConfig = NonNullable<Config['setpoints']['mqtt']>;

export class MqttSetpoint implements SetpointType {
    private client: mqtt.MqttClient;
    private cachedMessage: z.infer<typeof mqttSchema> | null = null;
    private logger: Logger;

    constructor({ config }: { config: MqttSetpointConfig }) {
        this.logger = pinoLogger.child({ module: 'MqttSetpoint' });

        this.client = mqtt.connect(config.host, {
            username: config.username,
            password: config.password,
        });

        this.client.on('connect', () => {
            this.client.subscribe(config.topic);
        });

        this.client.on('message', (_topic, message) => {
            const data = message.toString();

            const result = mqttSchema.safeParse(JSON.parse(data));

            if (!result.success) {
                this.logger.error({ message: 'Invalid MQTT message', data });
                return;
            }

            this.cachedMessage = result.data;
        });
    }

    getInverterControlLimit(): InverterControlLimit {
        const limit: InverterControlLimit = {
            source: 'mqtt',
            opModConnect: this.cachedMessage?.opModConnect,
            opModEnergize: this.cachedMessage?.opModEnergize,
            opModExpLimW: this.cachedMessage?.opModExpLimW,
            opModGenLimW: this.cachedMessage?.opModGenLimW,
            opModImpLimW: this.cachedMessage?.opModImpLimW,
            opModLoadLimW: this.cachedMessage?.opModLoadLimW,
            batteryChargeRatePercent:
                this.cachedMessage?.batteryChargeRatePercent,
            batteryDischargeRatePercent:
                this.cachedMessage?.batteryDischargeRatePercent,
            batteryStorageMode: this.cachedMessage?.batteryStorageMode,
            batteryTargetSocPercent:
                this.cachedMessage?.batteryTargetSocPercent,
            batteryImportTargetWatts:
                this.cachedMessage?.batteryImportTargetWatts,
            batteryExportTargetWatts:
                this.cachedMessage?.batteryExportTargetWatts,
            batterySocMinPercent: this.cachedMessage?.batterySocMinPercent,
            batterySocMaxPercent: this.cachedMessage?.batterySocMaxPercent,
            batteryChargeMaxWatts: this.cachedMessage?.batteryChargeMaxWatts,
            batteryDischargeMaxWatts:
                this.cachedMessage?.batteryDischargeMaxWatts,
            batteryPriorityMode: this.cachedMessage?.batteryPriorityMode,
            batteryGridChargingEnabled:
                this.cachedMessage?.batteryGridChargingEnabled,
            batteryGridChargingMaxWatts:
                this.cachedMessage?.batteryGridChargingMaxWatts,
        };

        writeControlLimit({ limit });

        return limit;
    }

    destroy(): void {
        this.client.end();
    }
}

const mqttSchema = z.object({
    opModConnect: z.boolean().optional(),
    opModEnergize: z.boolean().optional(),
    opModExpLimW: z.number().optional(),
    opModGenLimW: z.number().optional(),
    opModImpLimW: z.number().optional(),
    opModLoadLimW: z.number().optional(),
    batteryChargeRatePercent: z.number().optional(),
    batteryDischargeRatePercent: z.number().optional(),
    batteryStorageMode: z.number().optional(),
    batteryTargetSocPercent: z.number().optional(),
    batteryImportTargetWatts: z.number().optional(),
    batteryExportTargetWatts: z.number().optional(),
    batterySocMinPercent: z.number().optional(),
    batterySocMaxPercent: z.number().optional(),
    batteryChargeMaxWatts: z.number().optional(),
    batteryDischargeMaxWatts: z.number().optional(),
    batteryPriorityMode: z.enum(['export_first', 'battery_first']).optional(),
    batteryGridChargingEnabled: z.boolean().optional(),
    batteryGridChargingMaxWatts: z.number().optional(),
});
