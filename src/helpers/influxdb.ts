import { InfluxDB, Point } from '@influxdata/influxdb-client';
import type {
    ControlType,
    RandomizedControlSchedule,
} from '../sep2/helpers/controlScheduler';
import type { FallbackControl } from '../sep2/helpers/derControls';
import { numberWithPow10 } from './number';
import type { SiteMonitoringSample } from '../coordinator/helpers/siteMonitoringSample';
import type { DerMonitoringSample } from '../coordinator/helpers/derMonitoringSample';
import type { InverterControlLimit } from '../coordinator/helpers/inverterController';

const influxDB = new InfluxDB({
    url: `http://influxdb:${process.env['INFLUXDB_PORT']}`,
    token: process.env['INFLUXDB_ADMIN_TOKEN'],
});

const influxDbWriteApi = influxDB.getWriteApi(
    process.env['INFLUXDB_ORG']!,
    process.env['INFLUXDB_BUCKET']!,
);

export function writeSiteMonitoringSamplePoints(
    siteMonitoringSample: SiteMonitoringSample,
) {
    influxDbWriteApi.writePoints(
        [
            new Point('monitoringSample')
                .tag('type', 'site')
                .floatField('frequency', siteMonitoringSample.frequency),
            new Point('monitoringSample')
                .tag('type', 'site')
                .tag('phase', 'A')
                .floatField('realPower', siteMonitoringSample.realPower.phaseA)
                .floatField(
                    'reactivePower',
                    siteMonitoringSample.reactivePower.phaseA,
                )
                .floatField('voltage', siteMonitoringSample.voltage.phaseA),
            siteMonitoringSample.realPower.phaseB
                ? new Point('monitoringSample')
                      .tag('type', 'site')
                      .tag('phase', 'B')
                      .floatField(
                          'realPower',
                          siteMonitoringSample.realPower.phaseB,
                      )
                      .floatField(
                          'reactivePower',
                          siteMonitoringSample.reactivePower.phaseB,
                      )
                      .floatField(
                          'voltage',
                          siteMonitoringSample.voltage.phaseB,
                      )
                : null,
            siteMonitoringSample.realPower.phaseC
                ? new Point('monitoringSample')
                      .tag('type', 'site')
                      .tag('phase', 'C')
                      .floatField(
                          'realPower',
                          siteMonitoringSample.realPower.phaseC,
                      )
                      .floatField(
                          'reactivePower',
                          siteMonitoringSample.reactivePower.phaseC,
                      )
                      .floatField(
                          'voltage',
                          siteMonitoringSample.voltage.phaseC,
                      )
                : null,
        ].filter((point) => point !== null),
    );
}

export function writeDerMonitoringSamplePoints(
    derMonitoringSample: DerMonitoringSample,
) {
    influxDbWriteApi.writePoints(
        [
            new Point('monitoringSample')
                .tag('type', 'der')
                .floatField('reactivePower', derMonitoringSample.reactivePower)
                .floatField('frequency', derMonitoringSample.frequency),
            new Point('monitoringSample')
                .tag('type', 'der')
                .tag('phase', 'A')
                .floatField('realPower', derMonitoringSample.realPower.phaseA)
                .floatField('voltage', derMonitoringSample.voltage.phaseA),
            derMonitoringSample.realPower.phaseB
                ? new Point('monitoringSample')
                      .tag('type', 'der')
                      .tag('phase', 'B')
                      .floatField(
                          'realPower',
                          derMonitoringSample.realPower.phaseB,
                      )
                      .floatField('voltage', derMonitoringSample.voltage.phaseB)
                : null,
            derMonitoringSample.realPower.phaseC
                ? new Point('monitoringSample')
                      .tag('type', 'der')
                      .tag('phase', 'C')
                      .floatField(
                          'realPower',
                          derMonitoringSample.realPower.phaseC,
                      )
                      .floatField('voltage', derMonitoringSample.voltage.phaseC)
                : null,
        ].filter((point) => point !== null),
    );
}

export function writeControlSchedulerPoints({
    controlType,
    activeControlSchedule,
    fallbackControl,
}: {
    controlType: ControlType;
    activeControlSchedule: RandomizedControlSchedule | null;
    fallbackControl: FallbackControl;
}) {
    const activeControlPoint = (() => {
        if (!activeControlSchedule) {
            return null;
        }

        const point = new Point('controlScheduler').tag('control', 'active');

        switch (controlType) {
            case 'opModConnect': {
                const value =
                    activeControlSchedule.data.control.derControlBase[
                        'opModConnect'
                    ];

                if (value === undefined) {
                    return null;
                }
                point.booleanField('opModConnect', value);
                break;
            }
            case 'opModEnergize': {
                const value =
                    activeControlSchedule.data.control.derControlBase[
                        'opModEnergize'
                    ];

                if (value === undefined) {
                    return null;
                }
                point.booleanField('opModEnergize', value);
                break;
            }
            case 'opModExpLimW': {
                const value =
                    activeControlSchedule.data.control.derControlBase[
                        'opModExpLimW'
                    ];

                if (value === undefined) {
                    return null;
                }
                point.floatField(
                    'opModExpLimW',
                    numberWithPow10(value.value, value.multiplier),
                );
                break;
            }
            case 'opModGenLimW': {
                const value =
                    activeControlSchedule.data.control.derControlBase[
                        'opModGenLimW'
                    ];

                if (value === undefined) {
                    return null;
                }
                point.floatField(
                    'opModGenLimW',
                    numberWithPow10(value.value, value.multiplier),
                );
                break;
            }
            default:
                break;
        }

        return point;
    })();

    const fallbackControlPoint = (() => {
        if (fallbackControl.type === 'none') {
            return null;
        }

        const point = new Point('controlScheduler').tag('control', 'default');

        switch (controlType) {
            case 'opModConnect': {
                const value =
                    fallbackControl.data.defaultControl.derControlBase[
                        'opModConnect'
                    ];

                if (value === undefined) {
                    return null;
                }
                point.booleanField('opModConnect', value);
                break;
            }
            case 'opModEnergize': {
                const value =
                    fallbackControl.data.defaultControl.derControlBase[
                        'opModEnergize'
                    ];

                if (value === undefined) {
                    return null;
                }
                point.booleanField('opModEnergize', value);
                break;
            }
            case 'opModExpLimW': {
                const value =
                    fallbackControl.data.defaultControl.derControlBase[
                        'opModExpLimW'
                    ];

                if (value === undefined) {
                    return null;
                }
                point.floatField(
                    'opModExpLimW',
                    numberWithPow10(value.value, value.multiplier),
                );
                break;
            }
            case 'opModGenLimW': {
                const value =
                    fallbackControl.data.defaultControl.derControlBase[
                        'opModGenLimW'
                    ];

                if (value === undefined) {
                    return null;
                }
                point.floatField(
                    'opModGenLimW',
                    numberWithPow10(value.value, value.multiplier),
                );
                break;
            }
            default:
                break;
        }

        return point;
    })();

    influxDbWriteApi.writePoints(
        [activeControlPoint, fallbackControlPoint].filter(
            (point) => point !== null,
        ),
    );
}

export function writeInverterControllerPoints({
    deenergize,
    siteWatts,
    solarWatts,
    exportLimitWatts,
    exportLimitTargetSolarWatts,
    generationLimitWatts,
    targetSolarWatts,
    currentPowerRatio,
    targetSolarPowerRatio,
    rampedTargetSolarPowerRatio,
}: {
    deenergize: boolean;
    siteWatts: number;
    solarWatts: number;
    exportLimitWatts: number;
    exportLimitTargetSolarWatts: number;
    generationLimitWatts: number;
    targetSolarWatts: number;
    currentPowerRatio: number;
    targetSolarPowerRatio: number;
    rampedTargetSolarPowerRatio: number;
}) {
    influxDbWriteApi.writePoints([
        new Point('inverterControl')
            .booleanField('deenergize', deenergize)
            .floatField('siteWatts', siteWatts)
            .floatField('solarWatts', solarWatts)
            .floatField('exportLimitWatts', exportLimitWatts)
            .floatField(
                'exportLimitTargetSolarWatts',
                exportLimitTargetSolarWatts,
            )
            .floatField('generationLimitWatts', generationLimitWatts)
            .floatField('targetSolarWatts', targetSolarWatts)
            .floatField('currentPowerRatio', currentPowerRatio)
            .floatField('targetSolarPowerRatio', targetSolarPowerRatio)
            .floatField(
                'rampedTargetSolarPowerRatio',
                rampedTargetSolarPowerRatio,
            ),
    ]);
}

export function writeAmberPrice(number: number | undefined) {
    influxDbWriteApi.writePoints(
        [
            number !== undefined
                ? new Point('amber').floatField('price', number)
                : null,
        ].filter((point) => point !== null),
    );
}

export function writeControlLimit({
    limit,
    name,
}: {
    limit: InverterControlLimit;
    name: string;
}) {
    const point = new Point('controlLimit').tag('name', name);

    if (limit.opModConnect !== undefined) {
        point.booleanField('opModConnect', limit.opModConnect);
    }

    if (limit.opModEnergize !== undefined) {
        point.booleanField('opModEnergize', limit.opModEnergize);
    }

    if (limit.opModExpLimW !== undefined) {
        point.floatField('opModExpLimW', limit.opModExpLimW);
    }

    if (limit.opModGenLimW !== undefined) {
        point.floatField('opModGenLimW', limit.opModGenLimW);
    }

    influxDbWriteApi.writePoint(point);
}
