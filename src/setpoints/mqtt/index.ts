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

            // Battery-specific controls
            batteryChargeRatePercent: undefined, // Will be calculated by controller
            batteryDischargeRatePercent: undefined, // Will be calculated by controller
            batteryStorageMode: undefined, // Will be calculated by controller
            batteryTargetSocPercent:
                this.cachedMessage?.batterySocTargetPercent,
            batteryImportTargetWatts: this.cachedMessage?.importTargetWatts,
            batteryExportTargetWatts: this.cachedMessage?.exportTargetWatts,
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

    // Battery-specific controls
    exportTargetWatts: z.number().min(0).optional(),
    importTargetWatts: z.number().min(0).optional(),
    batterySocTargetPercent: z.number().min(0).max(100).optional(),
    batterySocMinPercent: z.number().min(0).max(100).optional(),
    batterySocMaxPercent: z.number().min(0).max(100).optional(),
    batteryChargeMaxWatts: z.number().min(0).optional(),
    batteryDischargeMaxWatts: z.number().min(0).optional(),
    batteryPriorityMode: z.enum(['export_first', 'battery_first']).optional(),
    batteryGridChargingEnabled: z.boolean().optional(),
    batteryGridChargingMaxWatts: z.number().min(0).optional(),
});
