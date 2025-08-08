import { type InverterControlLimit } from '../../coordinator/helpers/inverterController.js';
import { type SetpointType } from '../setpoint.js';
import { type Config } from '../../helpers/config.js';
import { writeControlLimit } from '../../helpers/influxdb.js';

type FixedSetpointConfig = NonNullable<Config['setpoints']['fixed']>;

export class FixedSetpoint implements SetpointType {
    private config: FixedSetpointConfig;

    constructor({ config }: { config: FixedSetpointConfig }) {
        this.config = config;
    }

    getInverterControlLimit(): InverterControlLimit {
        const limit: InverterControlLimit = {
            source: 'fixed',
            opModConnect: this.config.connect,
            opModEnergize: this.config.connect,
            opModExpLimW: this.config.exportLimitWatts,
            opModGenLimW: this.config.generationLimitWatts,
            opModImpLimW: this.config.importLimitWatts,
            opModLoadLimW: this.config.loadLimitWatts,
            
            // Battery-specific controls
            batteryChargeRatePercent: undefined, // Will be calculated by controller
            batteryDischargeRatePercent: undefined, // Will be calculated by controller
            batteryStorageMode: undefined, // Will be calculated by controller
            batteryTargetSocPercent: this.config.batterySocTargetPercent,
            batteryImportTargetWatts: this.config.importTargetWatts,
            batteryExportTargetWatts: this.config.exportTargetWatts,
            batteryChargeMaxWatts: this.config.batteryChargeMaxWatts,
            batteryDischargeMaxWatts: this.config.batteryDischargeMaxWatts,
            batteryPriorityMode: this.config.batteryPriorityMode,
            batteryGridChargingEnabled: this.config.batteryGridChargingEnabled,
            batteryGridChargingMaxWatts: this.config.batteryGridChargingMaxWatts,
        };

        writeControlLimit({ limit });

        return limit;
    }

    destroy(): void {
        // no op
    }
}
