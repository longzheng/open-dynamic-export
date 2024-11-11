import { type SiteSample } from '../siteSample.js';
import { SiteSamplePollerBase } from '../siteSamplePollerBase.js';
import { type Result } from '../../helpers/result.js';
import { type Config } from '../../helpers/config.js';
import { type GrowattMeterModels } from '../../connections/modbus/models/growatt/meter.js';
import { GrowattConnection } from '../../connections/modbus/connection/growatt.js';

type GrowattMeterConfig = Extract<Config['meter'], { type: 'growatt' }>;

export class GrowattMeterSiteSamplePoller extends SiteSamplePollerBase {
    private growattConnection: GrowattConnection;

    constructor({
        growattMeterConfig,
    }: {
        growattMeterConfig: GrowattMeterConfig;
    }) {
        super({ name: 'growattMeter', pollingIntervalMs: 200 });

        this.growattConnection = new GrowattConnection(growattMeterConfig);

        void this.startPolling();
    }

    override async getSiteSample(): Promise<Result<SiteSample>> {
        try {
            const start = performance.now();

            const meterModel = await this.growattConnection.getMeterModel();

            const end = performance.now();
            const duration = end - start;

            this.logger.trace({ duration, meterModel }, 'polled meter data');

            const siteSample = generateSiteSample({
                meter: meterModel,
            });

            return { success: true, value: siteSample };
        } catch (error) {
            return {
                success: false,
                error: new Error(
                    `Error loading meter data: ${
                        error instanceof Error ? error.message : 'Unknown error'
                    }`,
                ),
            };
        }
    }

    override onDestroy() {
        this.growattConnection.onDestroy();
    }
}

function generateSiteSample({
    meter,
}: {
    meter: GrowattMeterModels;
}): SiteSample {
    return {
        date: new Date(),
        realPower: {
            type: 'noPhase',
            net:
                meter.PactogridTotal > 0
                    ? -meter.PactogridTotal
                    : meter.PactouserTotal,
        },
        reactivePower: {
            type: 'noPhase',
            net: 0,
        },
        voltage: {
            type: 'perPhase',
            phaseA: meter.Vac1,
            phaseB: meter.Vac2,
            phaseC: meter.Vac3,
        },
        frequency: meter.Fac,
    };
}
