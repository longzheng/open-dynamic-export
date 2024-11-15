import { type Logger } from 'pino';
import { pinoLogger } from '../helpers/logger.js';
import EventEmitter from 'node:events';
import { type SiteSample } from './siteSample.js';
import { tryCatchResult } from '../helpers/result.js';
import { writeLatency } from '../helpers/influxdb.js';
import { withRetry } from '../helpers/withRetry.js';

export abstract class SiteSamplePollerBase extends EventEmitter<{
    data: [
        {
            siteSample: SiteSample;
        },
    ];
}> {
    protected logger: Logger;
    private pollingIntervalMs;
    private pollingTimer: NodeJS.Timeout | null = null;
    private siteSampleCache: SiteSample | null = null;
    private meterPollerName: string;

    constructor({
        name,
        pollingIntervalMs,
    }: {
        name: string;
        // how frequently at most to poll the data
        pollingIntervalMs: number;
    }) {
        super();

        this.pollingIntervalMs = pollingIntervalMs;
        this.logger = pinoLogger.child({
            module: 'SiteSamplePollerBase',
            meterPollerName: name,
        });
        this.meterPollerName = name;
    }

    public destroy() {
        if (this.pollingTimer) {
            clearTimeout(this.pollingTimer);
        }

        this.onDestroy();
    }

    abstract getSiteSample(): Promise<SiteSample>;

    abstract onDestroy(): void;

    get getSiteSampleCache(): SiteSample | null {
        return this.siteSampleCache;
    }

    protected async startPolling() {
        const start = performance.now();

        const siteSample = await tryCatchResult(() =>
            withRetry(() => this.getSiteSample(), {
                attempts: 3,
                functionName: 'getSiteSample',
                delayMilliseconds: 100,
            }),
        );

        const end = performance.now();
        const duration = end - start;

        writeLatency({
            field: 'siteSamplePoller',
            duration,
            tags: {
                meterPollerName: this.meterPollerName,
            },
        });

        if (siteSample.success) {
            this.siteSampleCache = siteSample.value;

            this.logger.trace({ duration, siteSample }, 'polled site sample');
        } else {
            this.logger.error(siteSample.error, 'Error polling site sample');
        }

        // this loop must meet sampling requirements and dynamic export requirements
        // Energex SEP2 Client Handbook specifies "As per the standard, samples should be taken every 200ms (10 cycles). If not capable of sampling this frequently, 1 second samples may be sufficient."
        // SA Power Networks – Dynamic Exports Utility Interconnection Handbook specifies "Average readings shall be generated by sampling at least every 5 seconds. For example, sample rates of less than 5 seconds are permitted."
        // we don't want to run this loop any more frequently than the polling interval to prevent overloading the connection
        const delay = Math.max(this.pollingIntervalMs - duration, 0);

        this.pollingTimer = setTimeout(() => {
            void this.startPolling();
        }, delay);

        if (siteSample.success) {
            this.emit('data', {
                siteSample: siteSample.value,
            });
        }
    }
}
