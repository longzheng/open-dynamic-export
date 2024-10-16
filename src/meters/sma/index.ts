import type { SiteSample } from '../siteSample.js';
import { SiteSamplePollerBase } from '../siteSamplePollerBase.js';
import type { Result } from '../../helpers/result.js';
import type { Config } from '../../helpers/config.js';
import type { SmaConnection } from '../../modbus/connection/sma.js';
import { getSmaConnection } from '../../modbus/connections.js';
import type {
    SmaCore1MeteringGridMs1,
    SmaCore1MeteringGridMs2,
} from '../../modbus/models/smaCore1MeteringGridMs.js';

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

            const meteringModel =
                await this.smaConnection.getMeteringGridMsModel();

            const end = performance.now();
            const duration = end - start;

            this.logger.trace(
                { duration, meterModel: meteringModel },
                'polled SunSpec meter data',
            );

            const siteSample = generateSiteSample({
                metering: meteringModel,
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
    metering,
}: {
    metering: SmaCore1MeteringGridMs1 & SmaCore1MeteringGridMs2;
}): SiteSample {
    return {
        date: new Date(),
        realPower: {
            type: 'perPhaseNet',
            phaseA: metering.W_phsA || metering.WIn_phsA,
            phaseB: metering.W_phsB || metering.WIn_phsB,
            phaseC: metering.W_phsC || metering.WIn_phsC,
            net:
                metering.W_phsA +
                    (metering.W_phsB ?? 0) +
                    (metering.W_phsC ?? 0) ||
                metering.WIn_phsA +
                    (metering.WIn_phsB ?? 0) +
                    (metering.WIn_phsC ?? 0),
        },
        reactivePower: {
            type: 'perPhaseNet',
            phaseA: metering.VAr_phsA,
            phaseB: metering.VAr_phsB,
            phaseC: metering.VAr_phsC,
            net:
                metering.VAr_phsA +
                (metering.VAr_phsB ?? 0) +
                (metering.VAr_phsC ?? 0),
        },
        voltage: {
            type: 'perPhase',
            phaseA: metering.PhV_phsA,
            phaseB: metering.PhV_phsB,
            phaseC: metering.PhV_phsC,
        },
        frequency: metering.Hz,
    };
}
