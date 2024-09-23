import type { Client } from 'openapi-fetch';
import createClient from 'openapi-fetch';
import type { paths } from './api.js';
import type { LimiterType } from '../../limiter.js';
import type { InverterControlLimit } from '../../../coordinator/helpers/inverterController.js';
import type { Logger } from 'pino';
import { logger as pinoLogger } from '../../../helpers/logger.js';
import {
    writeAmberPrice,
    writeControlLimit,
} from '../../../helpers/influxdb.js';

type Interval = {
    start: Date;
    end: Date;
    price: number;
};

export class AmberLimiter implements LimiterType {
    private client: Client<paths>;
    private siteId: string;
    private feedInIntervals: Interval[] = [];
    private logger: Logger;

    constructor({ apiKey, siteId }: { apiKey: string; siteId: string }) {
        this.client = createClient<paths>({
            baseUrl: 'https://api.amber.com.au/v1',
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        });
        this.siteId = siteId;
        this.logger = pinoLogger.child({ inverter: 'AmberControlLimit' });

        void this.poll();
    }

    getInverterControlLimit(): InverterControlLimit {
        const price = this.getCurrentPrice();

        // negative price means feed-in earns money
        // positive price means feed-in costs money
        const feedInCostsMoney = price && price > 0;

        const limit = feedInCostsMoney
            ? {
                  // if feed in price is negative, limit export to 0
                  opModConnect: undefined,
                  opModEnergize: undefined,
                  opModExpLimW: 0,
                  opModGenLimW: undefined,
              }
            : {
                  // can't find current interval, assume export is fine
                  // if feed in price is positive, export is fine
                  opModConnect: undefined,
                  opModEnergize: undefined,
                  opModExpLimW: undefined,
                  opModGenLimW: undefined,
              };

        writeControlLimit({ limit, name: 'amber' });

        return limit;
    }

    private async getSiteFeedInPrices() {
        const { data, error } = await this.client.GET(
            '/sites/{siteId}/prices/current',
            {
                params: {
                    path: {
                        siteId: this.siteId,
                    },
                    query: {
                        // cache future prices for 2 hours (at 30 minute intervals)
                        next: 2 * 2,
                    },
                },
            },
        );

        // Amber API docs don't have error types defined
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (error) {
            throw new Error(JSON.stringify(error));
        }

        const feedInIntervals = data
            .filter((interval) => interval.channelType === 'feedIn')
            .map(
                (interval) =>
                    ({
                        start: new Date(interval.startTime),
                        end: new Date(interval.endTime),
                        price: interval.perKwh,
                    }) satisfies Interval,
            );

        this.feedInIntervals = feedInIntervals;
    }

    private async poll() {
        try {
            await this.getSiteFeedInPrices();
        } catch (error) {
            this.logger.error(error, 'Failed to poll Amber API');
        } finally {
            setTimeout(
                () => {
                    void this.poll();
                },
                // poll every 15 minutes
                15 * 60 * 1000,
            );
        }
    }

    private getCurrentPrice() {
        // find current feed in price
        const now = new Date();
        const currentInterval = this.feedInIntervals.find(
            (interval) => interval.start <= now && now < interval.end,
        );

        this.logger.trace({ currentInterval }, 'Current interval');

        const currentPrice = currentInterval?.price;

        writeAmberPrice(currentPrice);

        return currentPrice;
    }
}
