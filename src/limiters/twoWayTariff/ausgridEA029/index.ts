import { type Logger } from 'pino';
import { type InverterControlLimit } from '../../../coordinator/helpers/inverterController.js';
import { type LimiterType } from '../../limiter.js';
import { writeControlLimit } from '../../../helpers/influxdb.js';
import { pinoLogger } from '../../../helpers/logger.js';

// https://www.ausgrid.com.au/Connections/Solar-and-batteries/Solar-tariffs
// https://www.ausgrid.com.au/-/media/Documents/Tariff/Solar-Factsheet-two-way-pricing-for-grid-exports.pdf?rev=2cef76fd13444c80b26df4c1a3213833
export class AusgridEA029Limiter implements LimiterType {
    private logger: Logger;

    constructor() {
        this.logger = pinoLogger.child({ module: 'AusgridEA029Limiter' });
    }

    getInverterControlLimit(): InverterControlLimit {
        const now = new Date();
        const timezoneOffset = now.getTimezoneOffset();

        // validate the user is configured for the NSW timezone
        if (timezoneOffset !== -600 && timezoneOffset !== -660) {
            throw new Error(
                `Two-way tariff limiter requires the timezone to be set to NSW, current timezoneOffset ${timezoneOffset}`,
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
                  }
                : {
                      source: 'twoWayTariff',
                      opModConnect: undefined,
                      opModEnergize: undefined,
                      opModExpLimW: undefined,
                      opModGenLimW: undefined,
                      opModImpLimW: undefined,
                      opModLoadLimW: undefined,
                  };

        writeControlLimit({ limit });

        return limit;
    }
}

// Customers are charged 1.2 cents/kWh for the electricity they export above a free threshold during the peak export period (10am to 3pm).
const chargeWindow: Window = {
    startHourOfDay: 10,
    endHourOfDay: 16,
};

// Customers receive a payment or credit of 2.3 cents/kWh for the electricity exported during the peak demand period (4pm to 9pm).
// TODO: reduce load or export battery during reward window
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const rewardWindow: Window = {
    startHourOfDay: 16,
    endHourOfDay: 22,
};

type Window = {
    startHourOfDay: number;
    endHourOfDay: number;
};
