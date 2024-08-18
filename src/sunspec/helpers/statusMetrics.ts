import {
    numberWithPow10,
    sumBigIntArray,
    sumNumbersNullableArray,
} from '../../helpers/number';
import type { StatusModel } from '../models/status';

export function getStatusMetrics(status: StatusModel) {
    return {
        PVConn: status.PVConn,
        StorConn: status.StorConn,
        ECPConn: status.ECPConn,
        ActWh: status.ActWh,
        ActVAh: status.ActVAh,
        ActVArhQ1: status.ActVArhQ1,
        ActVArhQ2: status.ActVArhQ2,
        ActVArhQ3: status.ActVArhQ3,
        ActVArhQ4: status.ActVArhQ4,
        VArAval:
            status.VArAval && status.VArAval_SF
                ? numberWithPow10(status.VArAval, status.VArAval_SF)
                : null,
        WAval:
            status.WAval && status.WAval_SF
                ? numberWithPow10(status.WAval, status.WAval_SF)
                : null,
    };
}

export function getAggregatedStatusMetrics(
    statuses: StatusModel[],
): ReturnType<typeof getStatusMetrics> {
    const metrics = statuses.map(getStatusMetrics);

    return {
        // get the highest value
        PVConn: Math.max(...metrics.map((metric) => metric.PVConn)),
        StorConn: Math.max(...metrics.map((metric) => metric.StorConn)),
        ECPConn: Math.max(...metrics.map((metric) => metric.ECPConn)),
        ActWh: sumBigIntArray(metrics.map((metric) => metric.ActWh)),
        ActVAh: sumBigIntArray(metrics.map((metric) => metric.ActVAh)),
        ActVArhQ1: sumBigIntArray(metrics.map((metric) => metric.ActVArhQ1)),
        ActVArhQ2: sumBigIntArray(metrics.map((metric) => metric.ActVArhQ2)),
        ActVArhQ3: sumBigIntArray(metrics.map((metric) => metric.ActVArhQ3)),
        ActVArhQ4: sumBigIntArray(metrics.map((metric) => metric.ActVArhQ4)),
        VArAval: sumNumbersNullableArray(
            metrics.map((metric) => metric.VArAval),
        ),
        WAval: sumNumbersNullableArray(metrics.map((metric) => metric.WAval)),
    };
}
