import type { MeterSunSpecConnection } from './connection/meter';
import type { SiteMonitoringSampleData } from '../coordinator/helpers/siteMonitoringSample';
import { SiteMonitoringPollerBase } from '../coordinator/helpers/siteMonitoringPollerBase';
import { assertNonNull } from '../helpers/null';
import { getMeterMetrics } from './helpers/meterMetrics';
import type { MeterModel } from './models/meter';

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
