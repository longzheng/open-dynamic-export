import type { Client } from 'openapi-fetch';
import createClient from 'openapi-fetch';
import type { Logger } from 'pino';
import { AxiosError } from 'axios';
import type { SetpointType } from '../../setpoint.js';
import type { InverterControlLimit } from '../../../coordinator/helpers/inverterController.js';
import { pinoLogger } from '../../../helpers/logger.js';
import {
    writeAmberPrice,
    writeControlLimit,
} from '../../../helpers/influxdb.js';
import { sanitizeAxiosError } from '../../../helpers/sanitizeAxiosError.js';
import type { paths } from './api.js';

type Interval = {
    start: Date;
    end: Date;
    price: number;
};

export class AmberSetpoint implements SetpointType {
    private client: Client<paths>;
    private siteId: string | null = null;
    private feedInIntervals: Interval[] = [];
    private logger: Logger;
    private pricePollTimer: NodeJS.Timeout | null = null;
    private abortController: AbortController;

    constructor({
        apiKey,
        siteId,
    }: {
        apiKey: string;
        siteId: string | undefined;
    }) {
        this.client = createClient<paths>({
            baseUrl: 'https://api.amber.com.au/v1',
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        });
        this.logger = pinoLogger.child({ inverter: 'AmberControlLimit' });
        this.abortController = new AbortController();

        void (async () => {
            this.siteId = siteId ?? (await this.getSiteId());
            void this.poll();
        })();
    }

    getInverterControlLimit(): InverterControlLimit {
        const price = this.getCurrentPrice();

        // negative price means feed-in earns money
        // positive price means feed-in costs money
        const feedInCostsMoney = price && price >= 0;

        const limit: InverterControlLimit = feedInCostsMoney
            ? {
                  source: 'negativeFeedIn',
                  // if feed in price is negative, limit export to 0
                  opModConnect: undefined,
                  opModEnergize: undefined,
                  opModExpLimW: 0,
                  opModGenLimW: undefined,
                  opModImpLimW: undefined,
                  opModLoadLimW: undefined,
              }
            : {
                  source: 'negativeFeedIn',
                  // can't find current interval, assume export is fine
                  // if feed in price is positive, export is fine
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

    private async getSiteFeedInPrices() {
        if (!this.siteId) {
            throw new Error('Site ID not set');
        }

        this.logger.debug('Fetching Amber feed-in prices');

        const { data, error } = await this.client.GET(
            '/sites/{siteId}/prices/current',
            {
                params: {
                    path: {
                        siteId: this.siteId,
                    },
                    query: {
                        // 12 forecast 5-minute intervals = 1 h of headroom
                        // past the current interval, so a transient Amber
                        // API outage doesn't drop us back to "no limit".
                        // Amber's API now returns 5-min intervals to match
                        // NEM dispatch — the `resolution` query param is
                        // ignored regardless of value. Forecast accuracy
                        // degrades further out (see `advancedPrice` spread),
                        // so 1 h is a deliberate ceiling.
                        next: 12,
                    },
                },
                signal: AbortSignal.any([
                    (AbortSignal.timeout(
                        // timeout after 10 seconds
                        10_000,
                    ),
                    this.abortController.signal),
                ]),
            },
        );

        // Amber API docs don't have error types defined
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (error || !data) {
            throw new Error(JSON.stringify(error));
        }

        const feedInIntervals = data
            .filter((interval) => interval.channelType === 'feedIn')
            .map(
                (interval) =>
                    ({
                        start: new Date(interval.startTime),
                        // Amber returns adjacent intervals as e.g.
                        // start=HH:MM:01 → end=HH:MM:00, leaving a 1-second
                        // gap at every boundary where neither interval matches
                        // `now`. Extend the end by 1s so the previous interval
                        // covers that boundary second; the next interval still
                        // matches at exactly its start (find() short-circuits
                        // on the first hit, so no duplicate match).
                        end: new Date(
                            new Date(interval.endTime).getTime() + 1000,
                        ),
                        price: interval.perKwh,
                    }) satisfies Interval,
            );

        this.logger.debug({ feedInIntervals }, 'Fetched Amber feed-in prices');

        this.feedInIntervals = feedInIntervals;
    }

    private async getSiteId(): Promise<string> {
        const { data, error } = await this.client.GET('/sites', {
            signal: AbortSignal.any([
                (AbortSignal.timeout(
                    // timeout after 10 seconds
                    10_000,
                ),
                this.abortController.signal),
            ]),
        });

        // Amber API docs don't have error types defined
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (error || !data) {
            throw new Error(JSON.stringify(error));
        }

        const siteIds = data
            .filter((site) => site.status === 'active')
            .map((site) => site.id);

        if (siteIds.length === 1) {
            this.logger.info(
                { siteId: siteIds[0] },
                'Amber site ID automatically selected',
            );

            return siteIds[0]!;
        }

        throw new Error(
            `Multiple active sites found, please specify site ID in config: ${siteIds.join(
                ', ',
            )}`,
        );
    }

    private async poll() {
        try {
            await this.getSiteFeedInPrices();
        } catch (error) {
            this.logger.error(
                error instanceof AxiosError ? sanitizeAxiosError(error) : error,
                'Failed to poll Amber API',
            );
        } finally {
            if (!this.abortController.signal.aborted) {
                this.pricePollTimer = setTimeout(
                    () => {
                        void this.poll();
                    },
                    // poll every 5 minutes — matches the NEM 5-minute dispatch
                    // interval so each new "current" 5-minute price is picked up
                    // promptly, instead of falling back to the 30-minute forecast
                    5 * 60 * 1000,
                );
            }
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

    public destroy() {
        this.abortController.abort();

        if (this.pricePollTimer) {
            clearTimeout(this.pricePollTimer);
        }
    }
}
