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

        void this.run();
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
    const aggregatedMeterMetrics = getMeterMetrics(meter);

    return {
        realPower: {
            phaseA: aggregatedMeterMetrics.WphA ?? aggregatedMeterMetrics.W,
            phaseB: aggregatedMeterMetrics.WphB,
            phaseC: aggregatedMeterMetrics.WphC,
        },
        reactivePower: {
            phaseA: assertNonNull(
                aggregatedMeterMetrics.VARphA ?? aggregatedMeterMetrics.VAR,
            ),
            phaseB: aggregatedMeterMetrics.VARphB,
            phaseC: aggregatedMeterMetrics.VARphC,
        },
        voltage: {
            phaseA: assertNonNull(
                aggregatedMeterMetrics.PhVphA ?? aggregatedMeterMetrics.PhV,
            ),
            phaseB: aggregatedMeterMetrics.PhVphB,
            phaseC: aggregatedMeterMetrics.PhVphC,
        },
        frequency: aggregatedMeterMetrics.Hz,
    };
}
