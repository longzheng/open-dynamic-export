import type { MeterSunSpecConnection } from './connection/meter.js';
import type { SiteMonitoringSampleData } from '../coordinator/helpers/siteMonitoringSample.js';
import { SiteMonitoringPollerBase } from '../coordinator/helpers/siteMonitoringPollerBase.js';
import { assertNonNull } from '../helpers/null.js';
import { getMeterMetrics } from './helpers/meterMetrics.js';
import type { MeterModel } from './models/meter.js';

export class SunSpecMeterPoller extends SiteMonitoringPollerBase {
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

    override async getSiteMonitoringSampleData(): Promise<SiteMonitoringSampleData> {
        const meterModel = await this.meterConnection.getMeterModel();

        this.logger.trace({ meterModel }, 'received data');

        const siteMonitoringSample = generateSiteMonitoringSample({
            meter: meterModel,
        });

        return siteMonitoringSample;
    }

    override onDestroy() {
        this.meterConnection.client.destroy(() => {});
    }
}

export function generateSiteMonitoringSample({
    meter,
}: {
    meter: MeterModel;
}): SiteMonitoringSampleData {
    const meterMetrics = getMeterMetrics(meter);

    return {
        realPower: meterMetrics.WphA
            ? {
                  type: 'perPhase',
                  phaseA: meterMetrics.WphA,
                  phaseB: meterMetrics.WphB,
                  phaseC: meterMetrics.WphC,
              }
            : { type: 'noPhase', value: meterMetrics.W },
        reactivePower: meterMetrics.VARphA
            ? {
                  type: 'perPhase',
                  phaseA: meterMetrics.VARphA,
                  phaseB: meterMetrics.VARphB,
                  phaseC: meterMetrics.VARphC,
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
