import EventEmitter from 'events';
import { pinoLogger } from '../../helpers/logger.js';
import { type DerSample } from '../../coordinator/helpers/derSample.js';
import { generateDerSample } from '../../coordinator/helpers/derSample.js';
import { type InverterData } from '../../inverter/inverterData.js';
import { type Result } from '../../helpers/result.js';
import { type InverterDataPollerBase } from '../../inverter/inverterDataPollerBase.js';
import { type Config } from '../../helpers/config.js';
import { SunSpecInverterDataPoller } from '../../inverter/sunspec/index.js';
import { SunSpecfloatInverterDataPoller } from '../../inverter/sunspecfloat/index.js';
import { type InverterConfiguration } from './inverterController.js';
import { type Logger } from 'pino';
import { SmaInverterDataPoller } from '../../inverter/sma/index.js';
import { MqttInverterDataPoller } from '../../inverter/mqtt/index.js';

export class InvertersPoller extends EventEmitter<{
    data: [DerSample];
}> {
    private inverterDataPollers: InverterDataPollerBase[];
    private inverterDataCacheMapByIndex: Map<number, Result<InverterData>> =
        new Map();
    private derSampleCache: DerSample | null = null;
    private logger: Logger;

    constructor({ config }: { config: Config }) {
        super();

        this.inverterDataPollers = config.inverters.map(
            (inverterConfig, index) => {
                const inverterOnData = (data: Result<InverterData>) => {
                    this.inverterDataCacheMapByIndex.set(index, data);

                    this.onData();
                };

                switch (inverterConfig.type) {
                    case 'sunspec': {
                        return new SunSpecInverterDataPoller({
                            sunspecInverterConfig: inverterConfig,
                            applyControl: config.inverterControl.enabled,
                            inverterIndex: index,
                        }).on('data', inverterOnData);
                    }
                    case 'sunspecfloat': {
                        return new SunSpecfloatInverterDataPoller({
                            sunspecInverterConfig: inverterConfig,
                            applyControl: config.inverterControl.enabled,
                            inverterIndex: index,
                        }).on('data', inverterOnData);
                    }
                    case 'sma': {
                        return new SmaInverterDataPoller({
                            smaInverterConfig: inverterConfig,
                            applyControl: config.inverterControl.enabled,
                            inverterIndex: index,
                        }).on('data', inverterOnData);
                    }
                    case 'mqtt': {
                        return new MqttInverterDataPoller({
                            mqttConfig: inverterConfig,
                            applyControl: config.inverterControl.enabled,
                            inverterIndex: index,
                        }).on('data', inverterOnData);
                    }
                }
            },
        );

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
        // we expect to have results (regardless of success or failure) for all inverters before processing the data
        if (
            this.getInvertersDataCache.length !==
            this.inverterDataPollers.length
        ) {
            this.logger.debug(
                {
                    invertersDataCount: this.getInvertersDataCache.length,
                    invertersCount: this.inverterDataPollers.length,
                },
                'waiting for all inverters data',
            );

            return;
        }

        // discard non-success inverters data
        // if we can't get data, assume the inverter is offline/inaccessible and is not contributing to the site
        const successInvertersData = this.getInvertersDataCache
            .filter((data) => data.success)
            .map((data) => data.value);

        const derSample = generateDerSample({
            invertersData: successInvertersData,
        });

        this.derSampleCache = derSample;

        this.logger.trace(
            { derSample, successInvertersCount: successInvertersData.length },
            'generated DER sample',
        );

        this.emit('data', derSample);
    }
}
