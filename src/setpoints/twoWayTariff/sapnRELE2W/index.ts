import { type Logger } from 'pino';
import { type InverterControlLimit } from '../../../coordinator/helpers/inverterController.js';
import { type SetpointType } from '../../setpoint.js';
import { writeControlLimit } from '../../../helpers/influxdb.js';
import { pinoLogger } from '../../../helpers/logger.js';

// https://www.sapowernetworks.com.au/public/download.jsp?id=328119
export class SapnRELE2WSetpoint implements SetpointType {
    private logger: Logger;

    constructor() {
        this.logger = pinoLogger.child({ module: 'SapnRELE2WSetpoint' });
    }

    getInverterControlLimit(): InverterControlLimit {
        const now = new Date();
        const timezoneOffset = now.getTimezoneOffset();

        // validate the user is configured for the SA timezone
        if (timezoneOffset !== -570 && timezoneOffset !== -630) {
            throw new Error(
                `Two-way tariff setpoint requires the timezone to be set to SA, current timezoneOffset ${timezoneOffset}`,
            );
        }

        const nowHour = now.getHours();

        const limit: InverterControlLimit =
            // if within charge window, zero export
            nowHour >= chargeWindow.startHourOfDay &&
            nowHour < chargeWindow.endHourOfDay
                ? {
                      source: 'twoWayTariff',
                      opModConnect: undefined,
                      opModEnergize: undefined,
                      opModExpLimW: 0,
                      opModGenLimW: undefined,
                      opModImpLimW: undefined,
                      opModLoadLimW: undefined,
                      // Battery controls - not used in two-way tariff setpoints
                      batteryChargeRatePercent: undefined,
                      batteryDischargeRatePercent: undefined,
                      batteryStorageMode: undefined,
                      batteryTargetSocPercent: undefined,
                      batteryImportTargetWatts: undefined,
                      batteryExportTargetWatts: undefined,
                      batteryChargeMaxWatts: undefined,
                      batteryDischargeMaxWatts: undefined,
                      batteryPriorityMode: undefined,
                      batteryGridChargingEnabled: undefined,
                      batteryGridChargingMaxWatts: undefined,
                  }
                : {
                      source: 'twoWayTariff',
                      opModConnect: undefined,
                      opModEnergize: undefined,
                      opModExpLimW: undefined,
                      opModGenLimW: undefined,
                      opModImpLimW: undefined,
                      opModLoadLimW: undefined,
                      // Battery controls - not used in two-way tariff setpoints
                      batteryChargeRatePercent: undefined,
                      batteryDischargeRatePercent: undefined,
                      batteryStorageMode: undefined,
                      batteryTargetSocPercent: undefined,
                      batteryImportTargetWatts: undefined,
                      batteryExportTargetWatts: undefined,
                      batteryChargeMaxWatts: undefined,
                      batteryDischargeMaxWatts: undefined,
                      batteryPriorityMode: undefined,
                      batteryGridChargingEnabled: undefined,
                      batteryGridChargingMaxWatts: undefined,
                  };

        writeControlLimit({ limit });

        return limit;
    }

    destroy(): void {
        // no op
    }
}

// The pricing signals and structure are designed to encourage self consumption rather than export during the Solar Sponge window of 10am – 4pm.
const chargeWindow: Window = {
    startHourOfDay: 10,
    endHourOfDay: 16,
};

// In the summer peak of November to March, 5pm – 9pm, customers are encouraged to export into the distribution network to access a credit.
// TODO: reduce load or export battery during reward window
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const rewardWindow: {
    months: number[];
    hourOfDay: Window;
} = {
    months: [
        10, // november
        11, // december
        0, // january
        1, // february
        2, // march
    ],
    hourOfDay: {
        startHourOfDay: 16,
        endHourOfDay: 22,
    },
};

type Window = {
    startHourOfDay: number;
    endHourOfDay: number;
};
