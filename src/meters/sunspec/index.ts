import type { MeterSunSpecConnection } from '../../sunspec/connection/meter.js';
import type { SiteSampleData } from '../siteSample.js';
import { SiteSamplePollerBase } from '../siteSamplePollerBase.js';
import { assertNonNull } from '../../helpers/null.js';
import { getMeterMetrics } from '../../sunspec/helpers/meterMetrics.js';
import type { MeterModel } from '../../sunspec/models/meter.js';

export class SunSpecMeterSiteSamplePoller extends SiteSamplePollerBase {
    private meterConnection: MeterSunSpecConnection;

    constructor({
        meterConnection,
    }: {
        meterConnection: MeterSunSpecConnection;
    }) {
        super({ meterName: 'SunSpecMeterPoller', pollingIntervalMs: 200 });

        this.meterConnection = meterConnection;

        void this.startPolling();
    }

    override async getSiteSampleData(): Promise<SiteSampleData> {
        const meterModel = await this.meterConnection.getMeterModel();

        this.logger.trace({ meterModel }, 'received data');

        const siteSample = generateSiteSample({
            meter: meterModel,
        });

        return siteSample;
    }

    override onDestroy() {
        this.meterConnection.client.close(() => {});
    }
}

export function generateSiteSample({
    meter,
}: {
    meter: MeterModel;
}): SiteSampleData {
    const meterMetrics = getMeterMetrics(meter);

    return {
        realPower: meterMetrics.WphA
            ? {
                  type: 'perPhaseNet',
                  phaseA: meterMetrics.WphA,
                  phaseB: meterMetrics.WphB,
                  phaseC: meterMetrics.WphC,
                  net: meterMetrics.W,
              }
            : { type: 'noPhase', value: meterMetrics.W },
        reactivePower: meterMetrics.VARphA
            ? {
                  type: 'perPhaseNet',
                  phaseA: meterMetrics.VARphA,
                  phaseB: meterMetrics.VARphB,
                  phaseC: meterMetrics.VARphC,
                  net: assertNonNull(meterMetrics.VAR),
              }
            : {
                  type: 'noPhase',
                  value: assertNonNull(meterMetrics.VAR),
              },
        voltage: {
            type: 'perPhase',
            phaseA: assertNonNull(meterMetrics.PhVphA ?? meterMetrics.PhV),
            phaseB: meterMetrics.PhVphB,
            phaseC: meterMetrics.PhVphC,
        },
        frequency: meterMetrics.Hz,
    };
}
