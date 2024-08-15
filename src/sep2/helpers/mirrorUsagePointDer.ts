import { parseStringPromise } from 'xml2js';
import { defaultPollPushRates, type SEP2Client } from '../client';
import {
    generateMirrorUsagePointResponse,
    MirrorUsagePointStatus,
    parseMirrorUsagePointXmlObject,
    type MirrorUsagePoint,
} from '../models/mirrorUsagePoint';
import { RoleFlagsType } from '../models/roleFlagsType';
import { objectToXml } from './xml';
import { ServiceKind } from '../models/serviceKind';
import { getMillisecondsToNextHourMinutesInterval } from '../../time';
import {
    generateMirrorMeterReadingResponse,
    type MirrorMeterReading,
} from '../models/mirrorMeterReading';
import {
    getSamplesIntervalSeconds,
    type MonitoringSample,
} from '../../coordinator.ts/monitoring';
import type { PerPhaseMeasurement } from '../../power';
import {
    averageNumbersArray,
    averageNumbersNullableArray,
    convertNumberToBaseAndPow10Exponent,
} from '../../number';
import { QualityFlags } from '../models/qualityFlags';
import { CommodityType } from '../models/commodityType';
import { KindType } from '../models/kindType';
import { DataQualifierType } from '../models/dataQualifierType';
import { FlowDirectionType } from '../models/flowDirectionType';
import { PhaseCode } from '../models/phaseCode';
import { UomType } from '../models/uomType';

type DerMonitoringSimple = Pick<MonitoringSample, 'date' | 'der'>;

type DerReading = {
    intervalSeconds: number;
    realPowerAverage: PerPhaseMeasurement;
    reactivePowerAverage: number;
    voltageAverage: PerPhaseMeasurement;
    frequency: {
        maximum: number;
        minimum: number;
    };
};

// TODO: refactor MirrorUsagePointSiteHelper and MirrorUsagePointSiteHelper to use a common base class with abstracts
export class MirrorUsagePointDerHelper {
    private client: SEP2Client;
    private mirrorUsagePointListHref: string | null = null;
    private mirrorUsagePoint: MirrorUsagePoint | null = null;
    private samples: DerMonitoringSimple[] = [];
    private roleFlags: RoleFlagsType =
        RoleFlagsType.isDER | RoleFlagsType.isMirror | RoleFlagsType.isSubmeter;
    private postTimer: NodeJS.Timeout | null = null;

    constructor({ client }: { client: SEP2Client }) {
        this.client = client;
    }

    public async updateMirrorUsagePointList({
        mirrorUsagePoints,
        mirrorUsagePointListHref,
    }: {
        mirrorUsagePoints: MirrorUsagePoint[];
        mirrorUsagePointListHref: string;
    }) {
        this.mirrorUsagePointListHref = mirrorUsagePointListHref;

        // find existing relevant mirrorUsagePoint
        const existingMirrorUsagePoint = mirrorUsagePoints.find((point) => {
            return (
                point.deviceLFDI === this.client.lfdi &&
                point.status === MirrorUsagePointStatus.On &&
                point.roleFlags === this.roleFlags
            );
        });

        if (existingMirrorUsagePoint) {
            this.mirrorUsagePoint = existingMirrorUsagePoint;
            return;
        }

        // if does not exist, create new mirrorUsagePoint
        this.mirrorUsagePoint = await this.postMirrorUsagePoint({
            mirrorUsagePoint: {
                mRID: this.client.generateUsagePointMrid(this.roleFlags),
                description: 'DER measurement',
                roleFlags: this.roleFlags,
                serviceCategoryKind: ServiceKind.Electricity,
                status: MirrorUsagePointStatus.On,
                deviceLFDI: this.client.lfdi,
            },
        });

        // start posting
        if (!this.postTimer) {
            void this.post();
        }
    }

    public addSample(sample: DerMonitoringSimple) {
        this.samples.push(sample);
    }

    public post() {
        const nextUpdateMilliseconds = getMillisecondsToNextHourMinutesInterval(
            // convert seconds to minutes
            (this.mirrorUsagePoint?.postRate ??
                defaultPollPushRates.mirrorUsagePointPush) / 60,
        );

        // set up next interval
        this.postTimer = setTimeout(() => {
            void this.post();
        }, nextUpdateMilliseconds);

        const samples = this.getSamplesAndClear();

        if (samples.length > 0) {
            const reading = this.getReadingFromSamples(samples);

            const lastUpdateTime = new Date();

            const nextUpdateTime = new Date(
                Date.now() + nextUpdateMilliseconds,
            );

            this.postRealPowerAverage({
                reading,
                lastUpdateTime,
                nextUpdateTime,
            });

            this.postReactivePowerAverage({
                reading,
                lastUpdateTime,
                nextUpdateTime,
            });

            this.postVoltageAverage({
                reading,
                lastUpdateTime,
                nextUpdateTime,
            });

            this.postFrequency({
                reading,
                lastUpdateTime,
                nextUpdateTime,
            });
        }
    }

    private postRealPowerAverage({
        reading,
        lastUpdateTime,
        nextUpdateTime,
    }: {
        reading: DerReading;
        lastUpdateTime: Date;
        nextUpdateTime: Date;
    }) {
        const phaseAValue = convertNumberToBaseAndPow10Exponent(
            reading.realPowerAverage.phaseA,
        );

        void this.postMirrorMeterReading({
            mirrorMeterReading: {
                mRID: this.client.generateMeterReadingMrid(),
                description: 'Average Real Power (W) - Phase A',
                lastUpdateTime,
                nextUpdateTime,
                Reading: {
                    value: phaseAValue.base,
                    qualityFlags: QualityFlags.Valid,
                },
                ReadingType: {
                    commodity: CommodityType.ElectricitySecondaryMeteredValue,
                    kind: KindType.Power,
                    dataQualifier: DataQualifierType.Average,
                    flowDirection: FlowDirectionType.Reverse,
                    intervalLength: reading.intervalSeconds,
                    phase: PhaseCode.PhaseA,
                    powerOfTenMultiplier: phaseAValue.pow10,
                    uom: UomType.W,
                },
            },
        });

        if (reading.realPowerAverage.phaseB) {
            const phaseBValue = convertNumberToBaseAndPow10Exponent(
                reading.realPowerAverage.phaseB,
            );

            void this.postMirrorMeterReading({
                mirrorMeterReading: {
                    mRID: this.client.generateMeterReadingMrid(),
                    description: 'Average Real Power (W) - Phase B',
                    lastUpdateTime,
                    nextUpdateTime,
                    Reading: {
                        value: phaseBValue.base,
                        qualityFlags: QualityFlags.Valid,
                    },
                    ReadingType: {
                        commodity:
                            CommodityType.ElectricitySecondaryMeteredValue,
                        kind: KindType.Power,
                        dataQualifier: DataQualifierType.Average,
                        flowDirection: FlowDirectionType.Reverse,
                        intervalLength: reading.intervalSeconds,
                        phase: PhaseCode.PhaseB,
                        powerOfTenMultiplier: phaseBValue.pow10,
                        uom: UomType.W,
                    },
                },
            });
        }

        if (reading.realPowerAverage.phaseC) {
            const phaseCValue = convertNumberToBaseAndPow10Exponent(
                reading.realPowerAverage.phaseC,
            );

            void this.postMirrorMeterReading({
                mirrorMeterReading: {
                    mRID: this.client.generateMeterReadingMrid(),
                    description: 'Average Real Power (W) - Phase C',
                    lastUpdateTime,
                    nextUpdateTime,
                    Reading: {
                        value: phaseCValue.base,
                        qualityFlags: QualityFlags.Valid,
                    },
                    ReadingType: {
                        commodity:
                            CommodityType.ElectricitySecondaryMeteredValue,
                        kind: KindType.Power,
                        dataQualifier: DataQualifierType.Average,
                        flowDirection: FlowDirectionType.Reverse,
                        intervalLength: reading.intervalSeconds,
                        phase: PhaseCode.PhaseC,
                        powerOfTenMultiplier: phaseCValue.pow10,
                        uom: UomType.W,
                    },
                },
            });
        }
    }

    private postReactivePowerAverage({
        reading,
        lastUpdateTime,
        nextUpdateTime,
    }: {
        reading: DerReading;
        lastUpdateTime: Date;
        nextUpdateTime: Date;
    }) {
        const value = convertNumberToBaseAndPow10Exponent(
            reading.reactivePowerAverage,
        );

        void this.postMirrorMeterReading({
            mirrorMeterReading: {
                mRID: this.client.generateMeterReadingMrid(),
                description: 'Average Reactive Power (VAR)',
                lastUpdateTime,
                nextUpdateTime,
                Reading: {
                    value: value.base,
                    qualityFlags: QualityFlags.Valid,
                },
                ReadingType: {
                    commodity: CommodityType.ElectricitySecondaryMeteredValue,
                    kind: KindType.Power,
                    dataQualifier: DataQualifierType.Average,
                    flowDirection: FlowDirectionType.Reverse,
                    intervalLength: reading.intervalSeconds,
                    phase: PhaseCode.NotApplicable,
                    powerOfTenMultiplier: value.pow10,
                    uom: UomType.var,
                },
            },
        });
    }

    private postVoltageAverage({
        reading,
        lastUpdateTime,
        nextUpdateTime,
    }: {
        reading: DerReading;
        lastUpdateTime: Date;
        nextUpdateTime: Date;
    }) {
        const phaseAValue = convertNumberToBaseAndPow10Exponent(
            reading.voltageAverage.phaseA,
        );

        void this.postMirrorMeterReading({
            mirrorMeterReading: {
                mRID: this.client.generateMeterReadingMrid(),
                description: 'Average Voltage (V) - Phase A',
                lastUpdateTime,
                nextUpdateTime,
                Reading: {
                    value: phaseAValue.base,
                    qualityFlags: QualityFlags.Valid,
                },
                ReadingType: {
                    commodity: CommodityType.ElectricitySecondaryMeteredValue,
                    kind: KindType.Power,
                    dataQualifier: DataQualifierType.Average,
                    flowDirection: FlowDirectionType.Reverse,
                    intervalLength: reading.intervalSeconds,
                    phase: PhaseCode.PhaseA,
                    powerOfTenMultiplier: phaseAValue.pow10,
                    uom: UomType.Voltage,
                },
            },
        });

        if (reading.voltageAverage.phaseB) {
            const phaseBValue = convertNumberToBaseAndPow10Exponent(
                reading.voltageAverage.phaseB,
            );

            void this.postMirrorMeterReading({
                mirrorMeterReading: {
                    mRID: this.client.generateMeterReadingMrid(),
                    description: 'Average Voltage (V) - Phase B',
                    lastUpdateTime,
                    nextUpdateTime,
                    Reading: {
                        value: phaseBValue.base,
                        qualityFlags: QualityFlags.Valid,
                    },
                    ReadingType: {
                        commodity:
                            CommodityType.ElectricitySecondaryMeteredValue,
                        kind: KindType.Power,
                        dataQualifier: DataQualifierType.Average,
                        flowDirection: FlowDirectionType.Reverse,
                        intervalLength: reading.intervalSeconds,
                        phase: PhaseCode.PhaseB,
                        powerOfTenMultiplier: phaseBValue.pow10,
                        uom: UomType.Voltage,
                    },
                },
            });
        }

        if (reading.voltageAverage.phaseC) {
            const phaseCValue = convertNumberToBaseAndPow10Exponent(
                reading.voltageAverage.phaseC,
            );

            void this.postMirrorMeterReading({
                mirrorMeterReading: {
                    mRID: this.client.generateMeterReadingMrid(),
                    description: 'Average Voltage (V) - Phase C',
                    lastUpdateTime,
                    nextUpdateTime,
                    Reading: {
                        value: phaseCValue.base,
                        qualityFlags: QualityFlags.Valid,
                    },
                    ReadingType: {
                        commodity:
                            CommodityType.ElectricitySecondaryMeteredValue,
                        kind: KindType.Power,
                        dataQualifier: DataQualifierType.Average,
                        flowDirection: FlowDirectionType.Reverse,
                        intervalLength: reading.intervalSeconds,
                        phase: PhaseCode.PhaseC,
                        powerOfTenMultiplier: phaseCValue.pow10,
                        uom: UomType.Voltage,
                    },
                },
            });
        }
    }

    private postFrequency({
        reading,
        lastUpdateTime,
        nextUpdateTime,
    }: {
        reading: DerReading;
        lastUpdateTime: Date;
        nextUpdateTime: Date;
    }) {
        const maximumValue = convertNumberToBaseAndPow10Exponent(
            reading.frequency.maximum,
        );
        const minimumValue = convertNumberToBaseAndPow10Exponent(
            reading.frequency.minimum,
        );

        void this.postMirrorMeterReading({
            mirrorMeterReading: {
                mRID: this.client.generateMeterReadingMrid(),
                description: 'Maximum Frequency (Hz)',
                lastUpdateTime,
                nextUpdateTime,
                Reading: {
                    value: maximumValue.base,
                    qualityFlags: QualityFlags.Valid,
                },
                ReadingType: {
                    commodity: CommodityType.ElectricitySecondaryMeteredValue,
                    kind: KindType.Power,
                    dataQualifier: DataQualifierType.Maximum,
                    flowDirection: FlowDirectionType.Reverse,
                    intervalLength: reading.intervalSeconds,
                    phase: PhaseCode.NotApplicable,
                    powerOfTenMultiplier: maximumValue.pow10,
                    uom: UomType.Hz,
                },
            },
        });

        void this.postMirrorMeterReading({
            mirrorMeterReading: {
                mRID: this.client.generateMeterReadingMrid(),
                description: 'Minimum Frequency (Hz)',
                lastUpdateTime,
                nextUpdateTime,
                Reading: {
                    value: minimumValue.base,
                    qualityFlags: QualityFlags.Valid,
                },
                ReadingType: {
                    commodity: CommodityType.ElectricitySecondaryMeteredValue,
                    kind: KindType.Power,
                    dataQualifier: DataQualifierType.Minimum,
                    flowDirection: FlowDirectionType.Reverse,
                    intervalLength: reading.intervalSeconds,
                    phase: PhaseCode.NotApplicable,
                    powerOfTenMultiplier: minimumValue.pow10,
                    uom: UomType.Hz,
                },
            },
        });
    }

    private getReadingFromSamples(samples: DerMonitoringSimple[]): DerReading {
        return {
            intervalSeconds: getSamplesIntervalSeconds(samples),
            realPowerAverage: {
                phaseA: averageNumbersArray(
                    samples.map((s) => s.der.realPower.phaseA),
                ),
                phaseB: averageNumbersNullableArray(
                    samples.map((s) => s.der.realPower.phaseB),
                ),
                phaseC: averageNumbersNullableArray(
                    samples.map((s) => s.der.realPower.phaseC),
                ),
            },
            reactivePowerAverage: averageNumbersArray(
                samples.map((s) => s.der.reactivePower),
            ),
            voltageAverage: {
                phaseA: averageNumbersArray(
                    samples.map((s) => s.der.voltage.phaseA),
                ),
                phaseB: averageNumbersNullableArray(
                    samples.map((s) => s.der.voltage.phaseB),
                ),
                phaseC: averageNumbersNullableArray(
                    samples.map((s) => s.der.voltage.phaseC),
                ),
            },
            frequency: {
                maximum: Math.max(...samples.map((s) => s.der.frequency)),
                minimum: Math.min(...samples.map((s) => s.der.frequency)),
            },
        };
    }

    private getSamplesAndClear() {
        const cache = this.samples;
        this.samples = [];
        return cache;
    }

    private async postMirrorUsagePoint({
        mirrorUsagePoint,
    }: {
        mirrorUsagePoint: MirrorUsagePoint;
    }) {
        if (!this.mirrorUsagePointListHref) {
            throw new Error('Missing mirrorUsagePointHref');
        }

        const data = generateMirrorUsagePointResponse(mirrorUsagePoint);
        const xml = objectToXml(data);

        const response = await this.client.postResponse(
            this.mirrorUsagePointListHref,
            xml,
        );

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
        const responseXml = await parseStringPromise(response.data);

        return parseMirrorUsagePointXmlObject(responseXml);
    }

    private async postMirrorMeterReading({
        mirrorMeterReading,
    }: {
        mirrorMeterReading: MirrorMeterReading;
    }) {
        if (!this.mirrorUsagePoint) {
            throw new Error('Missing mirrorUsagePoint');
        }

        if (!this.mirrorUsagePoint.href) {
            throw new Error('Missing mirrorUsagePoint href');
        }

        const data = generateMirrorMeterReadingResponse(mirrorMeterReading);
        const xml = objectToXml(data);

        await this.client.postResponse(this.mirrorUsagePoint.href, xml);
    }
}
