import { assertNonNull } from '../../null';
import type { PerPhaseMeasurement } from '../../power';
import { getAggregatedInverterMetrics } from '../../sunspec/helpers/inverterMetrics';
import { getAggregatedMeterMetrics } from '../../sunspec/helpers/meterMetrics';
import type { InverterModel } from '../../sunspec/models/inverter';
import { type MeterModel } from '../../sunspec/models/meter';

export type SunSpecTelemetry = {
    realPower: {
        site: PerPhaseMeasurement;
        der: PerPhaseMeasurement;
    };
    reactivePower: {
        site: PerPhaseMeasurement;
        der: number;
    };
    voltage: {
        site: PerPhaseMeasurement;
        der: PerPhaseMeasurement;
    };
    frequency: {
        site: number;
        der: number;
    };
};

export function getSunSpecTelemetry({
    inverters,
    meters,
}: {
    inverters: InverterModel[];
    meters: MeterModel[];
}): SunSpecTelemetry {
    const aggregatedMeterMetrics = getAggregatedMeterMetrics(meters);
    const aggregatedInverterMetrics = getAggregatedInverterMetrics(inverters);

    return {
        realPower: {
            site: {
                phaseA: aggregatedMeterMetrics.WphA ?? aggregatedMeterMetrics.W,
                phaseB: aggregatedMeterMetrics.WphB,
                phaseC: aggregatedMeterMetrics.WphC,
            },
            der: {
                // inverter W is only single phase
                // we have to manually calculate per phase power using voltage * current
                phaseA: aggregatedInverterMetrics.PhVphA
                    ? aggregatedInverterMetrics.AphA *
                      aggregatedInverterMetrics.PhVphA
                    : aggregatedInverterMetrics.W,
                phaseB: aggregatedInverterMetrics.PhVphB
                    ? aggregatedInverterMetrics.AphB *
                      aggregatedInverterMetrics.PhVphB
                    : null,
                phaseC: aggregatedInverterMetrics.PhVphC
                    ? aggregatedInverterMetrics.AphB *
                      aggregatedInverterMetrics.PhVphC
                    : null,
            },
        },
        reactivePower: {
            site: {
                phaseA: assertNonNull(
                    aggregatedMeterMetrics.VARphA ?? aggregatedMeterMetrics.VAR,
                ),
                phaseB: aggregatedMeterMetrics.VARphB,
                phaseC: aggregatedMeterMetrics.VARphC,
            },
            der: aggregatedInverterMetrics.VAr ?? 0,
        },
        voltage: {
            site: {
                phaseA: assertNonNull(
                    aggregatedMeterMetrics.PhVphA ?? aggregatedMeterMetrics.PhV,
                ),
                phaseB: aggregatedMeterMetrics.PhVphB,
                phaseC: aggregatedMeterMetrics.PhVphC,
            },
            der: {
                phaseA: assertNonNull(aggregatedInverterMetrics.PhVphA),
                phaseB: aggregatedInverterMetrics.PhVphB,
                phaseC: aggregatedInverterMetrics.PhVphC,
            },
        },
        frequency: {
            site: aggregatedMeterMetrics.Hz,
            der: aggregatedInverterMetrics.Hz,
        },
    };
}
