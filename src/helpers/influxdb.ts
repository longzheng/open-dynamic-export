import { InfluxDB, Point } from '@influxdata/influxdb-client';
import {
    type ControlType,
    type RandomizedControlSchedule,
} from '../sep2/helpers/controlScheduler.js';
import { numberWithPow10 } from './number.js';
import { type SiteSample } from '../meters/siteSample.js';
import { type DerSample } from '../coordinator/helpers/derSample.js';
import {
    type ActiveInverterControlLimit,
    type InverterControlLimit,
} from '../coordinator/helpers/inverterController.js';
import { type FallbackControl } from '../sep2/helpers/fallbackControl.js';
import { objectEntriesWithType } from './object.js';
import { env } from './env.js';

const influxDB = (() => {
    const org = env.INFLUXDB_ORG;
    const bucket = env.INFLUXDB_BUCKET;
    const host = env.INFLUXDB_HOST;
    const port = env.INFLUXDB_PORT;
    const token = env.INFLUXDB_ADMIN_TOKEN;

    if (!org || !bucket || !port || !token) {
        return null;
    }

    const db = new InfluxDB({
        url: `http://${host}:${port}`,
        token,
        writeOptions: {
            flushInterval: 5_000,
        },
    });

    const queryApi = db.getQueryApi(org);

    const writeApi = db.getWriteApi(org, bucket);

    return {
        queryApi,
        writeApi,
    };
})();

export function writeSiteSamplePoints(siteSample: SiteSample) {
    if (!influxDB) {
        return;
    }

    switch (siteSample.realPower.type) {
        case 'noPhase': {
            influxDB.writeApi.writePoint(
                new Point('sample')
                    .timestamp(siteSample.date)
                    .tag('type', 'site')
                    .tag('phase', 'net')
                    .floatField('realPower', siteSample.realPower.net),
            );
            break;
        }
        case 'perPhaseNet': {
            influxDB.writeApi.writePoint(
                new Point('sample')
                    .timestamp(siteSample.date)
                    .tag('type', 'site')
                    .tag('phase', 'net')
                    .floatField('realPower', siteSample.realPower.net),
            );

            if (siteSample.realPower.phaseA) {
                influxDB.writeApi.writePoint(
                    new Point('sample')
                        .timestamp(siteSample.date)
                        .tag('type', 'site')
                        .tag('phase', 'A')
                        .floatField('realPower', siteSample.realPower.phaseA),
                );
            }

            if (siteSample.realPower.phaseB) {
                influxDB.writeApi.writePoint(
                    new Point('sample')
                        .timestamp(siteSample.date)
                        .tag('type', 'site')
                        .tag('phase', 'B')
                        .floatField('realPower', siteSample.realPower.phaseB),
                );
            }

            if (siteSample.realPower.phaseC) {
                influxDB.writeApi.writePoint(
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
            influxDB.writeApi.writePoint(
                new Point('sample')
                    .timestamp(siteSample.date)
                    .tag('type', 'site')
                    .tag('phase', 'net')
                    .floatField('reactivePower', siteSample.reactivePower.net),
            );
            break;
        }
        case 'perPhaseNet': {
            influxDB.writeApi.writePoint(
                new Point('sample')
                    .timestamp(siteSample.date)
                    .tag('type', 'site')
                    .tag('phase', 'net')
                    .floatField('reactivePower', siteSample.reactivePower.net),
            );

            if (siteSample.reactivePower.phaseA) {
                influxDB.writeApi.writePoint(
                    new Point('sample')
                        .timestamp(siteSample.date)
                        .tag('type', 'site')
                        .tag('phase', 'A')
                        .floatField(
                            'reactivePower',
                            siteSample.reactivePower.phaseA,
                        ),
                );
            }

            if (siteSample.reactivePower.phaseB) {
                influxDB.writeApi.writePoint(
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
                influxDB.writeApi.writePoint(
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

    if (siteSample.voltage.phaseA) {
        influxDB.writeApi.writePoint(
            new Point('sample')
                .timestamp(siteSample.date)
                .tag('type', 'site')
                .tag('phase', 'A')
                .floatField('voltage', siteSample.voltage.phaseA),
        );
    }

    if (siteSample.voltage.phaseB) {
        influxDB.writeApi.writePoint(
            new Point('sample')
                .timestamp(siteSample.date)
                .tag('type', 'site')
                .tag('phase', 'B')
                .floatField('voltage', siteSample.voltage.phaseB),
        );
    }

    if (siteSample.voltage.phaseC) {
        influxDB.writeApi.writePoint(
            new Point('sample')
                .timestamp(siteSample.date)
                .tag('type', 'site')
                .tag('phase', 'C')
                .floatField('voltage', siteSample.voltage.phaseC),
        );
    }

    if (siteSample.frequency) {
        influxDB.writeApi.writePoint(
            new Point('sample')
                .timestamp(siteSample.date)
                .tag('type', 'site')
                .floatField('frequency', siteSample.frequency),
        );
    }
}

export function writeDerSamplePoints(derSample: DerSample) {
    if (!influxDB) {
        return;
    }

    switch (derSample.realPower.type) {
        case 'noPhase': {
            influxDB.writeApi.writePoint(
                new Point('sample')
                    .timestamp(derSample.date)
                    .tag('type', 'der')
                    .tag('phase', 'net')
                    .floatField('realPower', derSample.realPower.net),
            );
            break;
        }
        case 'perPhaseNet': {
            influxDB.writeApi.writePoint(
                new Point('sample')
                    .timestamp(derSample.date)
                    .tag('type', 'der')
                    .tag('phase', 'net')
                    .floatField('realPower', derSample.realPower.net),
            );

            if (derSample.realPower.phaseA) {
                influxDB.writeApi.writePoint(
                    new Point('sample')
                        .timestamp(derSample.date)
                        .tag('type', 'der')
                        .tag('phase', 'A')
                        .floatField('realPower', derSample.realPower.phaseA),
                );
            }

            if (derSample.realPower.phaseB) {
                influxDB.writeApi.writePoint(
                    new Point('sample')
                        .timestamp(derSample.date)
                        .tag('type', 'der')
                        .tag('phase', 'B')
                        .floatField('realPower', derSample.realPower.phaseB),
                );
            }

            if (derSample.realPower.phaseC) {
                influxDB.writeApi.writePoint(
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
            influxDB.writeApi.writePoint(
                new Point('sample')
                    .timestamp(derSample.date)
                    .tag('type', 'der')
                    .tag('phase', 'net')
                    .floatField('reactivePower', derSample.reactivePower.net),
            );
            break;
        }
        case 'perPhaseNet': {
            influxDB.writeApi.writePoint(
                new Point('sample')
                    .timestamp(derSample.date)
                    .tag('type', 'der')
                    .tag('phase', 'net')
                    .floatField('reactivePower', derSample.reactivePower.net),
            );

            if (derSample.reactivePower.phaseA) {
                influxDB.writeApi.writePoint(
                    new Point('sample')
                        .timestamp(derSample.date)
                        .tag('type', 'der')
                        .tag('phase', 'A')
                        .floatField(
                            'reactivePower',
                            derSample.reactivePower.phaseA,
                        ),
                );
            }

            if (derSample.reactivePower.phaseB) {
                influxDB.writeApi.writePoint(
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
                influxDB.writeApi.writePoint(
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
        if (derSample.voltage.phaseA) {
            influxDB.writeApi.writePoint(
                new Point('sample')
                    .timestamp(derSample.date)
                    .tag('type', 'der')
                    .tag('phase', 'A')
                    .floatField('voltage', derSample.voltage.phaseA),
            );
        }

        if (derSample.voltage.phaseB) {
            influxDB.writeApi.writePoint(
                new Point('sample')
                    .timestamp(derSample.date)
                    .tag('type', 'der')
                    .tag('phase', 'B')
                    .floatField('voltage', derSample.voltage.phaseB),
            );
        }

        if (derSample.voltage.phaseC) {
            influxDB.writeApi.writePoint(
                new Point('sample')
                    .timestamp(derSample.date)
                    .tag('type', 'der')
                    .tag('phase', 'C')
                    .floatField('voltage', derSample.voltage.phaseC),
            );
        }
    }

    if (derSample.frequency) {
        influxDB.writeApi.writePoint(
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
    if (!influxDB) {
        return;
    }

    const activeControlPoint = (() => {
        if (!activeControlSchedule) {
            return null;
        }

        const point = new Point('controlScheduler').tag('control', 'active');

        switch (controlType) {
            case 'opModConnect': {
                const value =
                    activeControlSchedule.derControlBase['opModConnect'];

                if (value === undefined) {
                    return null;
                }
                point.booleanField('opModConnect', value);
                break;
            }
            case 'opModEnergize': {
                const value =
                    activeControlSchedule.derControlBase['opModEnergize'];

                if (value === undefined) {
                    return null;
                }
                point.booleanField('opModEnergize', value);
                break;
            }
            case 'opModExpLimW': {
                const value =
                    activeControlSchedule.derControlBase['opModExpLimW'];

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
                    activeControlSchedule.derControlBase['opModGenLimW'];

                if (value === undefined) {
                    return null;
                }
                point.floatField(
                    'opModGenLimW',
                    numberWithPow10(value.value, value.multiplier),
                );
                break;
            }
            case 'opModImpLimW': {
                const value =
                    activeControlSchedule.derControlBase['opModImpLimW'];

                if (value === undefined) {
                    return null;
                }
                point.floatField(
                    'opModImpLimW',
                    numberWithPow10(value.value, value.multiplier),
                );
                break;
            }
            case 'opModLoadLimW': {
                const value =
                    activeControlSchedule.derControlBase['opModLoadLimW'];

                if (value === undefined) {
                    return null;
                }
                point.floatField(
                    'opModLoadLimW',
                    numberWithPow10(value.value, value.multiplier),
                );
                break;
            }
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
            case 'opModImpLimW': {
                const value =
                    fallbackControl.data.defaultControl.derControlBase[
                        'opModImpLimW'
                    ];

                if (value === undefined) {
                    return null;
                }
                point.floatField(
                    'opModImpLimW',
                    numberWithPow10(value.value, value.multiplier),
                );
                break;
            }

            case 'opModLoadLimW': {
                const value =
                    fallbackControl.data.defaultControl.derControlBase[
                        'opModLoadLimW'
                    ];

                if (value === undefined) {
                    return null;
                }
                point.floatField(
                    'opModLoadLimW',
                    numberWithPow10(value.value, value.multiplier),
                );
                break;
            }
        }

        return point;
    })();

    influxDB.writeApi.writePoints(
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
    if (!influxDB) {
        return;
    }

    influxDB.writeApi.writePoint(
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
    if (!influxDB) {
        return;
    }

    if (number === undefined) {
        return;
    }

    influxDB.writeApi.writePoint(
        new Point('amber').floatField('price', number),
    );
}

export function writeControlLimit({ limit }: { limit: InverterControlLimit }) {
    if (!influxDB) {
        return;
    }

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

    influxDB.writeApi.writePoint(point);
}

export function writeActiveControlLimit({
    limit,
}: {
    limit: ActiveInverterControlLimit;
}) {
    if (!influxDB) {
        return;
    }

    if (limit.opModConnect !== undefined) {
        influxDB.writeApi.writePoint(
            new Point('activeControlLimit')
                .tag('name', limit.opModConnect.source)
                .booleanField('opModConnect', limit.opModConnect.value),
        );
    }

    if (limit.opModEnergize !== undefined) {
        influxDB.writeApi.writePoint(
            new Point('activeControlLimit')
                .tag('name', limit.opModEnergize.source)
                .booleanField('opModEnergize', limit.opModEnergize.value),
        );
    }

    if (limit.opModExpLimW !== undefined) {
        influxDB.writeApi.writePoint(
            new Point('activeControlLimit')
                .tag('name', limit.opModExpLimW.source)
                .floatField('opModExpLimW', limit.opModExpLimW.value),
        );
    }

    if (limit.opModGenLimW !== undefined) {
        influxDB.writeApi.writePoint(
            new Point('activeControlLimit')
                .tag('name', limit.opModGenLimW.source)
                .floatField('opModGenLimW', limit.opModGenLimW.value),
        );
    }
}

export function queryRealPowerSite() {
    if (!influxDB) {
        throw new Error("InfluxDB isn't available");
    }

    return influxDB.queryApi.collectRows<{
        phase: string;
        type: string;
        _time: string;
        _value: number | null;
    }>(
        `
from(bucket: "data")
  |> range(start: -1h, stop: now())
  |> filter(fn: (r) => r["_measurement"] == "sample")
  |> filter(fn: (r) => r["_field"] == "realPower" and r["type"] == "site")
  |> aggregateWindow(every: 5s, fn: last, createEmpty: true)
`,
    );
}

export function queryDERRealPower() {
    if (!influxDB) {
        throw new Error("InfluxDB isn't available");
    }

    return influxDB.queryApi.collectRows<{
        phase: string;
        type: string;
        _time: string;
        _value: number | null;
    }>(
        `
from(bucket: "data")
  |> range(start: -1h, stop: now())
  |> filter(fn: (r) => r["_measurement"] == "sample")
  |> filter(fn: (r) => r["_field"] == "realPower" and r["type"] == "der")
  |> aggregateWindow(every: 5s, fn: last, createEmpty: true)
`,
    );
}

export function queryLoadRealPower() {
    if (!influxDB) {
        throw new Error("InfluxDB isn't available");
    }

    return influxDB.queryApi.collectRows<{
        phase: string;
        type: string;
        _time: string;
        _value: number | null;
    }>(
        `
from(bucket: "data")
  |> range(start: -1h, stop: now())
  |> filter(fn: (r) => r["_measurement"] == "sample")
  |> filter(fn: (r) => r["_field"] == "realPower" and r["type"] == "load")
  |> aggregateWindow(every: 5s, fn: last, createEmpty: true)
`,
    );
}

export function queryExportLimit() {
    if (!influxDB) {
        throw new Error("InfluxDB isn't available");
    }

    return influxDB.queryApi.collectRows<{
        name: string;
        _measurement: string;
        _time: string;
        _value: number | null;
        control: string;
    }>(
        `
from(bucket: "data")
  |> range(start: -1h, stop: now())
  |> filter(fn: (r) => r["_measurement"] == "controlScheduler" or r["_measurement"] == "controlLimit")
  |> filter(fn: (r) => r["_field"] == "opModExpLimW")
  |> aggregateWindow(every: 5s, fn: last, createEmpty: true)
`,
    );
}

export function queryGenerationLimit() {
    if (!influxDB) {
        throw new Error("InfluxDB isn't available");
    }

    return influxDB.queryApi.collectRows<{
        name: string;
        _measurement: string;
        _time: string;
        _value: number | null;
        control: string;
    }>(
        `
from(bucket: "data")
  |> range(start: -1h, stop: now())
  |> filter(fn: (r) => r["_measurement"] == "controlScheduler" or r["_measurement"] == "controlLimit")
  |> filter(fn: (r) => r["_field"] == "opModGenLimW")
  |> aggregateWindow(every: 5s, fn: last, createEmpty: true)
`,
    );
}

export function queryConnection() {
    if (!influxDB) {
        throw new Error("InfluxDB isn't available");
    }

    return influxDB.queryApi.collectRows<{
        name: string;
        _measurement: string;
        _time: string;
        _value: boolean | null;
    }>(
        `
from(bucket: "data")
  |> range(start: -1h, stop: now())
  |> filter(fn: (r) => r["_measurement"] == "controlScheduler" or r["_measurement"] == "controlLimit")
  |> filter(fn: (r) => r["_field"] == "opModConnect")
  |> aggregateWindow(every: 5s, fn: last, createEmpty: true)
  |> yield(name: "last")
`,
    );
}

export function queryEnergize() {
    if (!influxDB) {
        throw new Error("InfluxDB isn't available");
    }

    return influxDB.queryApi.collectRows<{
        name: string;
        _measurement: string;
        _time: string;
        _value: boolean | null;
    }>(
        `
from(bucket: "data")
  |> range(start: -1h, stop: now())
  |> filter(fn: (r) => r["_measurement"] == "controlScheduler" or r["_measurement"] == "controlLimit")
  |> filter(fn: (r) => r["_field"] == "opModEnergize")
  |> aggregateWindow(every: 5s, fn: last, createEmpty: true)
  |> yield(name: "last")
`,
    );
}

export function writeLoadWatts(loadWatts: number) {
    if (!influxDB) {
        return;
    }

    influxDB.writeApi.writePoint(
        new Point('sample')
            .timestamp(new Date())
            .tag('type', 'load')
            .tag('phase', 'net')
            .floatField('realPower', loadWatts),
    );
}

export function writeLatency({
    field,
    duration,
    tags,
}: {
    field: string;
    duration: number;
    tags?: Record<string, string>;
}) {
    if (!influxDB) {
        return;
    }

    const point = new Point('latency')
        .timestamp(new Date())
        .floatField(field, duration);

    if (tags) {
        for (const [name, value] of objectEntriesWithType(tags)) {
            point.tag(name, value);
        }
    }

    influxDB.writeApi.writePoint(point);
}
