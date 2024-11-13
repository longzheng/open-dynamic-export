import { type Result } from '../../helpers/result.js';
import { type Config } from '../../helpers/config.js';
import { withRetry } from '../../helpers/withRetry.js';
import { GoodweEtConnection } from '../../connections/goodwe/et.js';
import { SiteSamplePollerBase } from '../../meters/siteSamplePollerBase.js';
import { type GoodweEtMeterData } from '../../connections/goodwe/models/et/meterData.js';
import { type SiteSample } from '../siteSample.js';

export class GoodweEtSiteSamplePoller extends SiteSamplePollerBase {
    private connection: GoodweEtConnection;

    constructor({
        goodweEtConfig,
    }: {
        goodweEtConfig: Extract<
            Config['meter'],
            { type: 'goodwe'; model: 'et' }
        >;
    }) {
        super({
            name: 'GoodweEtSiteSamplePoller',
            pollingIntervalMs: 200,
        });

        this.connection = new GoodweEtConnection(goodweEtConfig);

        void this.startPolling();
    }

    override async getSiteSample(): Promise<Result<SiteSample>> {
        try {
            return await withRetry(
                async () => {
                    const start = performance.now();

                    const meterData = await this.connection.getMeterData();

                    const end = performance.now();
                    const duration = end - start;

                    this.logger.trace(
                        { duration, meterData },
                        'got meter data',
                    );

                    const siteSample = generateSiteSample({ meterData });

                    return {
                        success: true,
                        value: siteSample,
                    };
                },
                {
                    attempts: 3,
                    delayMilliseconds: 100,
                    functionName: 'getSiteSample',
                },
            );
        } catch (error) {
            this.logger.error(error, 'Failed to get meter data');

            return {
                success: false,
                error: new Error(
                    `Error loading meter data: ${error instanceof Error ? error.message : 'Unknown error'}`,
                ),
            };
        }
    }

    override onDestroy(): void {
        this.connection.onDestroy();
    }
}

function generateSiteSample({
    meterData,
}: {
    meterData: GoodweEtMeterData;
}): SiteSample {
    return {
        date: new Date(),
        realPower: {
            type: 'perPhaseNet',
            phaseA: meterData.MeterActivepowerR2 || meterData.MeterActivepowerR,
            phaseB: meterData.MeterActivepowerS2 || meterData.MeterActivepowerS,
            phaseC: meterData.MeterActivepowerT2 || meterData.MeterActivepowerT,
            net:
                meterData.MeterTotalActivepower2 ||
                meterData.MeterTotalActivepower,
        },
        reactivePower: {
            type: 'perPhaseNet',
            phaseA: meterData.MeterReactivepowerR,
            phaseB: meterData.MeterReactivepowerS,
            phaseC: meterData.MeterReactivepowerT,
            net:
                meterData.MeterTotalReactivepower2 ||
                meterData.MeterTotalReactivepower,
        },
        voltage: {
            type: 'perPhase',
            phaseA: meterData.meterVoltageR,
            phaseB: meterData.meterVoltageS,
            phaseC: meterData.meterVoltageT,
        },
        frequency: meterData.MeterFrequence,
    };
}
