import { InfluxDB, Point } from '@influxdata/influxdb-client';
import type { MonitoringSample } from '../coordinator/helpers/monitoring';
import type {
    ControlType,
    RandomizedControlSchedule,
} from '../sep2/helpers/controlScheduler';
import type { FallbackControl } from '../sep2/helpers/derControls';
import { numberWithPow10 } from './number';

const influxDB = new InfluxDB({
    url: `http://influxdb:${process.env['INFLUXDB_PORT']}`,
    token: process.env['INFLUXDB_ADMIN_TOKEN'],
});

const influxDbWriteApi = influxDB.getWriteApi(
    process.env['INFLUXDB_ORG']!,
    process.env['INFLUXDB_BUCKET']!,
);

export function writeMonitoringSamplePoints(
    monitoringSample: MonitoringSample,
) {
    influxDbWriteApi.writePoints(
        [
            // site
            new Point('monitoringSample')
                .tag('type', 'site')
                .floatField('frequency', monitoringSample.der.frequency),
            new Point('monitoringSample')
                .tag('type', 'site')
                .tag('phase', 'A')
                .floatField('realPower', monitoringSample.site.realPower.phaseA)
                .floatField(
                    'reactivePower',
                    monitoringSample.site.reactivePower.phaseA,
                )
                .floatField('voltage', monitoringSample.site.voltage.phaseA),
            monitoringSample.site.realPower.phaseB
                ? new Point('monitoringSample')
                      .tag('type', 'site')
                      .tag('phase', 'B')
                      .floatField(
                          'realPower',
                          monitoringSample.site.realPower.phaseB,
                      )
                      .floatField(
                          'reactivePower',
                          monitoringSample.site.reactivePower.phaseB,
                      )
                      .floatField(
                          'voltage',
                          monitoringSample.site.voltage.phaseB,
                      )
                : null,
            monitoringSample.site.realPower.phaseC
                ? new Point('monitoringSample')
                      .tag('type', 'site')
                      .tag('phase', 'C')
                      .floatField(
                          'realPower',
                          monitoringSample.site.realPower.phaseC,
                      )
                      .floatField(
                          'reactivePower',
                          monitoringSample.site.reactivePower.phaseC,
                      )
                      .floatField(
                          'voltage',
                          monitoringSample.site.voltage.phaseC,
                      )
                : null,
            // der
            new Point('monitoringSample')
                .tag('type', 'der')
                .floatField('reactivePower', monitoringSample.der.reactivePower)
                .floatField('frequency', monitoringSample.der.frequency),
            new Point('monitoringSample')
                .tag('type', 'der')
                .tag('phase', 'A')
                .floatField('realPower', monitoringSample.der.realPower.phaseA)
                .floatField('voltage', monitoringSample.der.voltage.phaseA),
            monitoringSample.der.realPower.phaseB
                ? new Point('monitoringSample')
                      .tag('type', 'der')
                      .tag('phase', 'B')
                      .floatField(
                          'realPower',
                          monitoringSample.der.realPower.phaseB,
                      )
                      .floatField(
                          'voltage',
                          monitoringSample.der.voltage.phaseB,
                      )
                : null,
            monitoringSample.der.realPower.phaseC
                ? new Point('monitoringSample')
                      .tag('type', 'der')
                      .tag('phase', 'C')
                      .floatField(
                          'realPower',
                          monitoringSample.der.realPower.phaseC,
                      )
                      .floatField(
                          'voltage',
                          monitoringSample.der.voltage.phaseC,
                      )
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
