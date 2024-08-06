import { averageNumbersArray, averageNumbersNullableArray } from '../../number';
import type { PerPhaseMeasurement } from '../../power';
import type { SunSpecTelemetry } from './sunspec';

type CsipAusDerMonitoring = {
    realPower: {
        siteAverage: PerPhaseMeasurement;
        derAverage: PerPhaseMeasurement;
    };
    reactivePower: {
        siteAverage: PerPhaseMeasurement;
        derAverage: number;
    };
    voltage: {
        siteAverage: PerPhaseMeasurement;
        derAverage: PerPhaseMeasurement;
    };
    frequency: {
        site: {
            maximum: number;
            minimum: number;
        };
        der: {
            maximum: number;
            minimum: number;
        };
    };
};

// note: this function will loop through the array many times for each value
// it does not bother with optimising the calculation of the values as we will not be dealing with big lists
export function generateCsipAusDerMonitoring(
    telemetryList: SunSpecTelemetry[],
): CsipAusDerMonitoring {
    return {
        realPower: {
            siteAverage: {
                phaseA: averageNumbersArray(
                    telemetryList.map((t) => t.realPower.site.phaseA),
                ),
                phaseB: averageNumbersNullableArray(
                    telemetryList.map((t) => t.realPower.site.phaseB),
                ),
                phaseC: averageNumbersNullableArray(
                    telemetryList.map((t) => t.realPower.site.phaseC),
                ),
            },
            derAverage: {
                phaseA: averageNumbersArray(
                    telemetryList.map((t) => t.realPower.der.phaseA),
                ),
                phaseB: averageNumbersNullableArray(
                    telemetryList.map((t) => t.realPower.der.phaseB),
                ),
                phaseC: averageNumbersNullableArray(
                    telemetryList.map((t) => t.realPower.der.phaseC),
                ),
            },
        },
        reactivePower: {
            siteAverage: {
                phaseA: averageNumbersArray(
                    telemetryList.map((t) => t.reactivePower.site.phaseA),
                ),
                phaseB: averageNumbersNullableArray(
                    telemetryList.map((t) => t.reactivePower.site.phaseB),
                ),
                phaseC: averageNumbersNullableArray(
                    telemetryList.map((t) => t.reactivePower.site.phaseC),
                ),
            },
            derAverage: averageNumbersArray(
                telemetryList.map((t) => t.reactivePower.der),
            ),
        },
        voltage: {
            siteAverage: {
                phaseA: averageNumbersArray(
                    telemetryList.map((t) => t.voltage.site.phaseA),
                ),
                phaseB: averageNumbersNullableArray(
                    telemetryList.map((t) => t.voltage.site.phaseB),
                ),
                phaseC: averageNumbersNullableArray(
                    telemetryList.map((t) => t.voltage.site.phaseC),
                ),
            },
            derAverage: {
                phaseA: averageNumbersArray(
                    telemetryList.map((t) => t.voltage.der.phaseA),
                ),
                phaseB: averageNumbersNullableArray(
                    telemetryList.map((t) => t.voltage.der.phaseB),
                ),
                phaseC: averageNumbersNullableArray(
                    telemetryList.map((t) => t.voltage.der.phaseC),
                ),
            },
        },
        frequency: {
            site: {
                maximum: Math.max(
                    ...telemetryList.map((t) => t.frequency.site),
                ),
                minimum: Math.min(
                    ...telemetryList.map((t) => t.frequency.site),
                ),
            },
            der: {
                maximum: Math.max(...telemetryList.map((t) => t.frequency.der)),
                minimum: Math.min(...telemetryList.map((t) => t.frequency.der)),
            },
        },
    };
}
