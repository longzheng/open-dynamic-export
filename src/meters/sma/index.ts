import type { SiteSample } from '../siteSample.js';
import { SiteSamplePollerBase } from '../siteSamplePollerBase.js';
import type { Result } from '../../helpers/result.js';
import type { Config } from '../../helpers/config.js';
import type { SmaConnection } from '../../modbus/connection/sma.js';
import { getSmaConnection } from '../../modbus/connections.js';
import type {
    SmaCore1Meter1,
    SmaCore1Meter2,
} from '../../modbus/models/smaCore1Meter.js';

type SmaMeterConfig = Extract<Config['meter'], { type: 'sma' }>;

export class SmaMeterSiteSamplePoller extends SiteSamplePollerBase {
    private smaConnection: SmaConnection;
    private model: SmaMeterConfig['model'];

    constructor({ smaMeterConfig }: { smaMeterConfig: SmaMeterConfig }) {
        super({ name: 'SunSpecMeterPoller', pollingIntervalMs: 200 });

        this.smaConnection = getSmaConnection(smaMeterConfig);
        this.model = smaMeterConfig.model;

        void this.startPolling();
    }

    override async getSiteSample(): Promise<Result<SiteSample>> {
        try {
            const start = performance.now();

            const meterModel = await this.smaConnection.getMeterModel();

            const end = performance.now();
            const duration = end - start;

            this.logger.trace(
                { duration, meterModel },
                'polled SunSpec meter data',
            );

            const siteSample = generateSiteSample({
                meter: meterModel,
            });

            return { success: true, value: siteSample };
        } catch (error) {
            return {
                success: false,
                error: new Error(
                    `Error loading SunSpec meter data: ${
                        error instanceof Error ? error.message : 'Unknown error'
                    }`,
                ),
            };
        }
    }

    override onDestroy() {
        this.smaConnection.client.close(() => {});
    }
}

function generateSiteSample({
    meter,
}: {
    meter: SmaCore1Meter1 & SmaCore1Meter2;
}): SiteSample {
    return {
        date: new Date(),
        realPower: {
            type: 'perPhaseNet',
            phaseA: meter.W_phsA || meter.WIn_phsA,
            phaseB: meter.W_phsB || meter.WIn_phsB,
            phaseC: meter.W_phsC || meter.WIn_phsC,
            net:
                meter.W_phsA + (meter.W_phsB ?? 0) + (meter.W_phsC ?? 0) ||
                meter.WIn_phsA + (meter.WIn_phsB ?? 0) + (meter.WIn_phsC ?? 0),
        },
        reactivePower: {
            type: 'perPhaseNet',
            phaseA: meter.VAr_phsA,
            phaseB: meter.VAr_phsB,
            phaseC: meter.VAr_phsC,
            net: meter.VAr_phsA + (meter.VAr_phsB ?? 0) + (meter.VAr_phsC ?? 0),
        },
        voltage: {
            type: 'perPhase',
            phaseA: meter.PhV_phsA,
            phaseB: meter.PhV_phsB,
            phaseC: meter.PhV_phsC,
        },
        frequency: meter.Hz,
    };
}
