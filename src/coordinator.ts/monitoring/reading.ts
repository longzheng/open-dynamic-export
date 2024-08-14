import { averageNumbersArray, averageNumbersNullableArray } from '../../number';
import type { PerPhaseMeasurement } from '../../power';
import type { MonitoringSample } from './sample';

type MonitoringReading = {
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

// average an array of samples over a time period to generate a reading with averages/max/min
// note: this function will loop through the array many times for each value
// it does not bother with optimising the calculation of the values as we will not be dealing with big lists
export function generateMonitoringReading(
    samples: MonitoringSample[],
): MonitoringReading {
    return {
        realPower: {
            siteAverage: {
                phaseA: averageNumbersArray(
                    samples.map((t) => t.realPower.site.phaseA),
                ),
                phaseB: averageNumbersNullableArray(
                    samples.map((t) => t.realPower.site.phaseB),
                ),
                phaseC: averageNumbersNullableArray(
                    samples.map((t) => t.realPower.site.phaseC),
                ),
            },
            derAverage: {
                phaseA: averageNumbersArray(
                    samples.map((t) => t.realPower.der.phaseA),
                ),
                phaseB: averageNumbersNullableArray(
                    samples.map((t) => t.realPower.der.phaseB),
                ),
                phaseC: averageNumbersNullableArray(
                    samples.map((t) => t.realPower.der.phaseC),
                ),
            },
        },
        reactivePower: {
            siteAverage: {
                phaseA: averageNumbersArray(
                    samples.map((t) => t.reactivePower.site.phaseA),
                ),
                phaseB: averageNumbersNullableArray(
                    samples.map((t) => t.reactivePower.site.phaseB),
                ),
                phaseC: averageNumbersNullableArray(
                    samples.map((t) => t.reactivePower.site.phaseC),
                ),
            },
            derAverage: averageNumbersArray(
                samples.map((t) => t.reactivePower.der),
            ),
        },
        voltage: {
            siteAverage: {
                phaseA: averageNumbersArray(
                    samples.map((t) => t.voltage.site.phaseA),
                ),
                phaseB: averageNumbersNullableArray(
                    samples.map((t) => t.voltage.site.phaseB),
                ),
                phaseC: averageNumbersNullableArray(
                    samples.map((t) => t.voltage.site.phaseC),
                ),
            },
            derAverage: {
                phaseA: averageNumbersArray(
                    samples.map((t) => t.voltage.der.phaseA),
                ),
                phaseB: averageNumbersNullableArray(
                    samples.map((t) => t.voltage.der.phaseB),
                ),
                phaseC: averageNumbersNullableArray(
                    samples.map((t) => t.voltage.der.phaseC),
                ),
            },
        },
        frequency: {
            site: {
                maximum: Math.max(...samples.map((t) => t.frequency.site)),
                minimum: Math.min(...samples.map((t) => t.frequency.site)),
            },
            der: {
                maximum: Math.max(...samples.map((t) => t.frequency.der)),
                minimum: Math.min(...samples.map((t) => t.frequency.der)),
            },
        },
    };
}
