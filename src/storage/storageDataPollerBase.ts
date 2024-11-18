import { type Logger } from 'pino';
import { pinoLogger } from '../helpers/logger.js';
import EventEmitter from 'node:events';
import { tryCatchResult, type Result } from '../helpers/result.js';
import { writeLatency } from '../helpers/influxdb.js';
import { withRetry } from '../helpers/withRetry.js';
import { type StorageData } from './storageData.js';

export abstract class StorageDataPollerBase extends EventEmitter<{
    data: [Result<StorageData>];
}> {
    protected logger: Logger;
    private pollingIntervalMs;
    private pollingTimer: NodeJS.Timeout | null = null;
    private storageDataCache: Result<StorageData> | null = null;
    protected applyControl: boolean;
    protected readonly storageIndex: number;
    private storagePollerName: string;

    constructor({
        name,
        storageIndex,
        pollingIntervalMs,
        applyControl,
    }: {
        name: string;
        storageIndex: number;
        // how frequently at most to poll the data
        pollingIntervalMs: number;
        applyControl: boolean;
    }) {
        super();

        this.pollingIntervalMs = pollingIntervalMs;
        this.logger = pinoLogger.child({
            module: 'StorageDataPollerBase',
            storagePollerName: name,
            storageIndex,
        });
        this.applyControl = applyControl;
        this.storageIndex = storageIndex;
        this.storagePollerName = name;
    }

    public destroy() {
        if (this.pollingTimer) {
            clearTimeout(this.pollingTimer);
        }

        this.onDestroy();
    }

    abstract getStorageData(): Promise<StorageData>;

    abstract onControl(): Promise<void>;

    abstract onDestroy(): void;

    get getStorageDataCache(): Result<StorageData> | null {
        return this.storageDataCache;
    }

    protected async startPolling() {
        const start = performance.now();

        const storageData = await tryCatchResult(() =>
            withRetry(() => this.getStorageData(), {
                attempts: 3,
                functionName: 'getStorageData',
                delayMilliseconds: 100,
            }),
        );

        this.storageDataCache = storageData;

        const end = performance.now();
        const duration = end - start;

        writeLatency({
            field: 'StorageDataPollerBase',
            duration,
            tags: {
                storageIndex: this.storageIndex.toString(),
                storagePollerName: this.storagePollerName,
            },
        });

        if (storageData.success) {
            this.logger.trace({ duration, storageData }, 'polled storage data');
        } else {
            this.logger.error(storageData.error, 'Error polling storage data');
        }

        const delay = Math.max(this.pollingIntervalMs - duration, 0);

        this.pollingTimer = setTimeout(() => {
            void this.startPolling();
        }, delay);

        this.emit('data', storageData);
    }
}
