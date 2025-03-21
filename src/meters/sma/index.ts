import { type SiteSample } from '../siteSample.js';
import { SiteSamplePollerBase } from '../siteSamplePollerBase.js';
import { type Config } from '../../helpers/config.js';
import { SmaConnection } from '../../connections/modbus/connection/sma.js';
import { type SmaCore1MeteringGridMsModels } from '../../connections/modbus/models/sma/core1/meteringGridMs.js';

type SmaMeterConfig = Extract<Config['meter'], { type: 'sma' }>;

export class SmaMeterSiteSamplePoller extends SiteSamplePollerBase {
    private smaConnection: SmaConnection;
    private model: SmaMeterConfig['model'];

    constructor({ smaMeterConfig }: { smaMeterConfig: SmaMeterConfig }) {
        super({
            name: 'sma',
            pollingIntervalMs: smaMeterConfig.pollingIntervalMs,
        });

        this.smaConnection = new SmaConnection(smaMeterConfig);
        this.model = smaMeterConfig.model;

        void this.startPolling();
    }

    override async getSiteSample(): Promise<SiteSample> {
        const start = performance.now();

        const meteringModel = await this.smaConnection.getMeteringGridMsModel();

        const end = performance.now();
        const duration = end - start;

        this.logger.trace(
            { duration, meterModel: meteringModel },
            'polled SMA meter data',
        );

        const siteSample = generateSiteSample({
            metering: meteringModel,
        });

        return siteSample;
    }

    override onDestroy() {
        this.smaConnection.onDestroy();
    }
}

function generateSiteSample({
    metering,
}: {
    metering: SmaCore1MeteringGridMsModels;
}): SiteSample {
    return {
        date: new Date(),
        realPower: {
            type: 'perPhaseNet',
            phaseA: metering.W_phsA || metering.WIn_phsA,
            phaseB: metering.W_phsB || metering.WIn_phsB,
            phaseC: metering.W_phsC || metering.WIn_phsC,
            net:
                (metering.W_phsA ?? 0) +
                    (metering.W_phsB ?? 0) +
                    (metering.W_phsC ?? 0) ||
                (metering.WIn_phsA ?? 0) +
                    (metering.WIn_phsB ?? 0) +
                    (metering.WIn_phsC ?? 0),
        },
        reactivePower: {
            type: 'perPhaseNet',
            phaseA: metering.VAr_phsA,
            phaseB: metering.VAr_phsB,
            phaseC: metering.VAr_phsC,
            net:
                (metering.VAr_phsA ?? 0) +
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
