import { InfluxDB, Point } from '@influxdata/influxdb-client';
import type {
    ControlType,
    RandomizedControlSchedule,
} from '../sep2/helpers/controlScheduler.js';
import { numberWithPow10 } from './number.js';
import type { SiteSample } from '../meters/siteSample.js';
import type { DerSample } from '../coordinator/helpers/derSample.js';
import type { InverterControlLimit } from '../coordinator/helpers/inverterController.js';
import type { FallbackControl } from '../sep2/helpers/fallbackControl.js';

const influxDB = new InfluxDB({
    url: `http://influxdb:${process.env['INFLUXDB_PORT'] ?? 8086}`,
    token: process.env['INFLUXDB_ADMIN_TOKEN'],
    writeOptions: {
        flushInterval: 5_000,
    },
});

const writeApi = influxDB.getWriteApi(
    process.env['INFLUXDB_ORG']!,
    process.env['INFLUXDB_BUCKET']!,
);

export function writeSiteSamplePoints(siteSample: SiteSample) {
    switch (siteSample.realPower.type) {
        case 'noPhase': {
            writeApi.writePoint(
                new Point('sample')
                    .timestamp(siteSample.date)
                    .tag('type', 'site')
                    .tag('phase', 'net')
                    .floatField('realPower', siteSample.realPower.net),
            );
            break;
        }
        case 'perPhaseNet': {
            writeApi.writePoint(
                new Point('sample')
                    .timestamp(siteSample.date)
                    .tag('type', 'site')
                    .tag('phase', 'net')
                    .floatField('realPower', siteSample.realPower.net),
            );

            writeApi.writePoint(
                new Point('sample')
                    .timestamp(siteSample.date)
                    .tag('type', 'site')
                    .tag('phase', 'A')
                    .floatField('realPower', siteSample.realPower.phaseA),
            );

            if (siteSample.realPower.phaseB) {
                writeApi.writePoint(
                    new Point('sample')
                        .timestamp(siteSample.date)
                        .tag('type', 'site')
                        .tag('phase', 'B')
                        .floatField('realPower', siteSample.realPower.phaseB),
                );
            }

            if (siteSample.realPower.phaseC) {
                writeApi.writePoint(
                    new Point('sample')
                        .timestamp(siteSample.date)
                        .tag('type', 'site')
                        .tag('phase', 'C')
                        .floatField('realPower', siteSample.realPower.phaseC),
                );
            }
        }
    }

    switch (siteSample.reactivePower.type) {
        case 'noPhase': {
            writeApi.writePoint(
                new Point('sample')
                    .timestamp(siteSample.date)
                    .tag('type', 'site')
                    .tag('phase', 'net')
                    .floatField('reactivePower', siteSample.reactivePower.net),
            );
            break;
        }
        case 'perPhaseNet': {
            writeApi.writePoint(
                new Point('sample')
                    .timestamp(siteSample.date)
                    .tag('type', 'site')
                    .tag('phase', 'net')
                    .floatField('reactivePower', siteSample.reactivePower.net),
            );

            writeApi.writePoint(
                new Point('sample')
                    .timestamp(siteSample.date)
                    .tag('type', 'site')
                    .tag('phase', 'A')
                    .floatField(
                        'reactivePower',
                        siteSample.reactivePower.phaseA,
                    ),
            );

            if (siteSample.reactivePower.phaseB) {
                writeApi.writePoint(
                    new Point('sample')
                        .timestamp(siteSample.date)
                        .tag('type', 'site')
                        .tag('phase', 'B')
                        .floatField(
                            'reactivePower',
                            siteSample.reactivePower.phaseB,
                        ),
                );
            }

            if (siteSample.reactivePower.phaseC) {
                writeApi.writePoint(
                    new Point('sample')
                        .timestamp(siteSample.date)
                        .tag('type', 'site')
                        .tag('phase', 'C')
                        .floatField(
                            'reactivePower',
                            siteSample.reactivePower.phaseC,
                        ),
                );
            }
        }
    }

    writeApi.writePoint(
        new Point('sample')
            .timestamp(siteSample.date)
            .tag('type', 'site')
            .tag('phase', 'A')
            .floatField('voltage', siteSample.voltage.phaseA),
    );

    if (siteSample.voltage.phaseB) {
        writeApi.writePoint(
            new Point('sample')
                .timestamp(siteSample.date)
                .tag('type', 'site')
                .tag('phase', 'B')
                .floatField('voltage', siteSample.voltage.phaseB),
        );
    }

    if (siteSample.voltage.phaseC) {
        writeApi.writePoint(
            new Point('sample')
                .timestamp(siteSample.date)
                .tag('type', 'site')
                .tag('phase', 'C')
                .floatField('voltage', siteSample.voltage.phaseC),
        );
    }

    if (siteSample.frequency) {
        writeApi.writePoint(
            new Point('sample')
                .timestamp(siteSample.date)
                .tag('type', 'site')
                .floatField('frequency', siteSample.frequency),
        );
    }
}

export function writeDerSamplePoints(derSample: DerSample) {
    switch (derSample.realPower.type) {
        case 'noPhase': {
            writeApi.writePoint(
                new Point('sample')
                    .timestamp(derSample.date)
                    .tag('type', 'der')
                    .tag('phase', 'net')
                    .floatField('realPower', derSample.realPower.net),
            );
            break;
        }
        case 'perPhaseNet': {
            writeApi.writePoint(
                new Point('sample')
                    .timestamp(derSample.date)
                    .tag('type', 'der')
                    .tag('phase', 'net')
                    .floatField('realPower', derSample.realPower.net),
            );

            writeApi.writePoint(
                new Point('sample')
                    .timestamp(derSample.date)
                    .tag('type', 'der')
                    .tag('phase', 'A')
                    .floatField('realPower', derSample.realPower.phaseA),
            );

            if (derSample.realPower.phaseB) {
                writeApi.writePoint(
                    new Point('sample')
                        .timestamp(derSample.date)
                        .tag('type', 'der')
                        .tag('phase', 'B')
                        .floatField('realPower', derSample.realPower.phaseB),
                );
            }

            if (derSample.realPower.phaseC) {
                writeApi.writePoint(
                    new Point('sample')
                        .timestamp(derSample.date)
                        .tag('type', 'der')
                        .tag('phase', 'C')
                        .floatField('realPower', derSample.realPower.phaseC),
                );
            }
        }
    }

    switch (derSample.reactivePower.type) {
        case 'noPhase': {
            writeApi.writePoint(
                new Point('sample')
                    .timestamp(derSample.date)
                    .tag('type', 'der')
                    .tag('phase', 'net')
                    .floatField('reactivePower', derSample.reactivePower.net),
            );
            break;
        }
        case 'perPhaseNet': {
            writeApi.writePoint(
                new Point('sample')
                    .timestamp(derSample.date)
                    .tag('type', 'der')
                    .tag('phase', 'net')
                    .floatField('reactivePower', derSample.reactivePower.net),
            );

            writeApi.writePoint(
                new Point('sample')
                    .timestamp(derSample.date)
                    .tag('type', 'der')
                    .tag('phase', 'A')
                    .floatField(
                        'reactivePower',
                        derSample.reactivePower.phaseA,
                    ),
            );

            if (derSample.reactivePower.phaseB) {
                writeApi.writePoint(
                    new Point('sample')
                        .timestamp(derSample.date)
                        .tag('type', 'der')
                        .tag('phase', 'B')
                        .floatField(
                            'reactivePower',
                            derSample.reactivePower.phaseB,
                        ),
                );
            }

            if (derSample.reactivePower.phaseC) {
                writeApi.writePoint(
                    new Point('sample')
                        .timestamp(derSample.date)
                        .tag('type', 'der')
                        .tag('phase', 'C')
                        .floatField(
                            'reactivePower',
                            derSample.reactivePower.phaseC,
                        ),
                );
            }
        }
    }

    if (derSample.voltage) {
        writeApi.writePoint(
            new Point('sample')
                .timestamp(derSample.date)
                .tag('type', 'der')
                .tag('phase', 'A')
                .floatField('voltage', derSample.voltage.phaseA),
        );

        if (derSample.voltage.phaseB) {
            writeApi.writePoint(
                new Point('sample')
                    .timestamp(derSample.date)
                    .tag('type', 'der')
                    .tag('phase', 'B')
                    .floatField('voltage', derSample.voltage.phaseB),
            );
        }

        if (derSample.voltage.phaseC) {
            writeApi.writePoint(
                new Point('sample')
                    .timestamp(derSample.date)
                    .tag('type', 'der')
                    .tag('phase', 'C')
                    .floatField('voltage', derSample.voltage.phaseC),
            );
        }
    }

    if (derSample.frequency) {
        writeApi.writePoint(
            new Point('sample')
                .timestamp(derSample.date)
                .tag('type', 'der')
                .floatField('frequency', derSample.frequency),
        );
    }
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

    writeApi.writePoints(
        [activeControlPoint, fallbackControlPoint].filter(
            (point) => point !== null,
        ),
    );
}

export function writeInverterControllerPoints({
    disconnect,
    siteWatts,
    solarWatts,
    exportLimitWatts,
    exportLimitTargetSolarWatts,
    generationLimitWatts,
    targetSolarWatts,
    targetSolarPowerRatio,
}: {
    disconnect: boolean;
    siteWatts: number;
    solarWatts: number;
    exportLimitWatts: number;
    exportLimitTargetSolarWatts: number;
    generationLimitWatts: number;
    targetSolarWatts: number;
    targetSolarPowerRatio: number;
}) {
    writeApi.writePoint(
        new Point('inverterControl')
            .booleanField('disconnect', disconnect)
            .floatField('siteWatts', siteWatts)
            .floatField('solarWatts', solarWatts)
            .floatField('exportLimitWatts', exportLimitWatts)
            .floatField(
                'exportLimitTargetSolarWatts',
                exportLimitTargetSolarWatts,
            )
            .floatField('generationLimitWatts', generationLimitWatts)
            .floatField('targetSolarWatts', targetSolarWatts)
            .floatField('targetSolarPowerRatio', targetSolarPowerRatio),
    );
}

export function writeAmberPrice(number: number | undefined) {
    if (number === undefined) {
        return;
    }

    writeApi.writePoint(new Point('amber').floatField('price', number));
}

export function writeControlLimit({ limit }: { limit: InverterControlLimit }) {
    const point = new Point('controlLimit').tag('name', limit.source);

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

    writeApi.writePoint(point);
}

export function writeLoadWatts(loadWatts: number) {
    writeApi.writePoint(
        new Point('sample')
            .timestamp(new Date())
            .tag('type', 'load')
            .tag('phase', 'net')
            .floatField('realPower', loadWatts),
    );
}
