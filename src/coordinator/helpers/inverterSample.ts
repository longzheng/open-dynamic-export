import EventEmitter from 'events';
import { logger as pinoLogger } from '../../helpers/logger.js';
import type { DerSample } from '../../coordinator/helpers/derSample.js';
import { generateDerSample } from '../../coordinator/helpers/derSample.js';
import type { InverterData } from '../../inverter/inverterData.js';
import type { Result } from '../../helpers/result.js';
import type { InverterDataPollerBase } from '../../inverter/inverterDataPollerBase.js';
import type { Config } from '../../helpers/config.js';
import { getSunSpecInvertersConnection } from '../../sunspec/connections.js';
import { SunSpecInverterDataPoller } from '../../inverter/sunspec/index.js';
import type { InverterConfiguration } from './inverterController.js';
import type { Logger } from 'pino';

export type InvertersData = {
    invertersData: InverterData[];
    derSample: DerSample;
};

export class InvertersPoller extends EventEmitter<{
    data: [InvertersData];
}> {
    private inverterDataPollers: InverterDataPollerBase[];
    private inverterDataCacheMapByIndex: Map<number, Result<InverterData>> =
        new Map();
    private derSampleCache: DerSample | null = null;
    private logger: Logger;

    constructor({ config }: { config: Config }) {
        super();

        this.inverterDataPollers = config.inverters.map((inverter, index) => {
            switch (inverter.type) {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                case 'sunspec': {
                    const inverterConnection =
                        getSunSpecInvertersConnection(inverter);

                    return new SunSpecInverterDataPoller({
                        inverterConnection,
                        applyControl: config.inverterControl,
                    }).on('data', (data) => {
                        this.inverterDataCacheMapByIndex.set(index, data);

                        this.onData();
                    });
                }
            }
        });

        this.logger = pinoLogger.child({ module: 'InvertersPoller' });
    }

    public destroy() {
        this.inverterDataPollers.forEach((poller) => {
            poller.destroy();
        });
    }

    public async onControl(configuration: InverterConfiguration) {
        await Promise.all(
            this.inverterDataPollers.map((poller) => {
                return poller.onControl(configuration);
            }),
        );
    }

    public get getInvertersDataCache() {
        return Array.from(this.inverterDataCacheMapByIndex.values());
    }

    public get getDerSampleCache() {
        return this.derSampleCache;
    }

    private onData() {
        const successInvertersData = this.getInvertersDataCache
            .filter((data) => data.success)
            .map((data) => data.value);

        const derSample = generateDerSample({
            invertersData: successInvertersData,
        });

        this.derSampleCache = derSample;

        this.logger.trace({ derSample }, 'generated DER sample');

        this.emit('data', {
            invertersData: successInvertersData,
            derSample,
        });
    }
}
