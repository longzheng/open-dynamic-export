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
import { getMillisecondsToNextHourMinutesInterval } from '../../helpers/time';
import {
    generateMirrorMeterReadingResponse,
    type MirrorMeterReading,
} from '../models/mirrorMeterReading';
import {
    getSamplesIntervalSeconds,
    type MonitoringSample,
} from '../../coordinator/helpers/monitoring';
import type { PerPhaseMeasurement } from '../../helpers/power';
import {
    averageNumbersArray,
    averageNumbersNullableArray,
    convertNumberToBaseAndPow10Exponent,
} from '../../helpers/number';
import { QualityFlags } from '../models/qualityFlags';
import { CommodityType } from '../models/commodityType';
import { KindType } from '../models/kindType';
import { DataQualifierType } from '../models/dataQualifierType';
import { FlowDirectionType } from '../models/flowDirectionType';
import { PhaseCode } from '../models/phaseCode';
import { UomType } from '../models/uomType';

type SiteMonitoringSimple = Pick<MonitoringSample, 'date' | 'site'>;

type SiteReading = {
    intervalSeconds: number;
    realPowerAverage: PerPhaseMeasurement;
    reactivePowerAverage: PerPhaseMeasurement;
    voltageAverage: PerPhaseMeasurement;
    frequency: {
        maximum: number;
        minimum: number;
    };
};

// TODO: refactor MirrorUsagePointSiteHelper and MirrorUsagePointSiteHelper to use a common base class with abstracts
export class MirrorUsagePointSiteHelper {
    private client: SEP2Client;
    private mirrorUsagePointListHref: string | null = null;
    private mirrorUsagePoint: MirrorUsagePoint | null = null;
    private samples: SiteMonitoringSimple[] = [];
    private roleFlags: RoleFlagsType =
        RoleFlagsType.isPremisesAggregationPoint | RoleFlagsType.isMirror;
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

            this.startPosting();
            return;
        }

        // if does not exist, create new mirrorUsagePoint
        this.mirrorUsagePoint = await this.postMirrorUsagePoint({
            mirrorUsagePoint: {
                mRID: this.client.generateUsagePointMrid(this.roleFlags),
                description: 'Site measurement',
                roleFlags: this.roleFlags,
                serviceCategoryKind: ServiceKind.Electricity,
                status: MirrorUsagePointStatus.On,
                deviceLFDI: this.client.lfdi,
            },
        });

        this.startPosting();
    }

    public addSample(sample: SiteMonitoringSimple) {
        this.samples.push(sample);
    }

    private startPosting() {
        // if there's already a post timer, do nothing
        if (this.postTimer) {
            return;
        }

        void this.post();
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
        reading: SiteReading;
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
                    flowDirection: FlowDirectionType.Forward,
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
                        flowDirection: FlowDirectionType.Forward,
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
                        flowDirection: FlowDirectionType.Forward,
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
        reading: SiteReading;
        lastUpdateTime: Date;
        nextUpdateTime: Date;
    }) {
        const phaseAValue = convertNumberToBaseAndPow10Exponent(
            reading.reactivePowerAverage.phaseA,
        );

        void this.postMirrorMeterReading({
            mirrorMeterReading: {
                mRID: this.client.generateMeterReadingMrid(),
                description: 'Average Reactive Power (VAR) - Phase A',
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
                    flowDirection: FlowDirectionType.Forward,
                    intervalLength: reading.intervalSeconds,
                    phase: PhaseCode.PhaseA,
                    powerOfTenMultiplier: phaseAValue.pow10,
                    uom: UomType.var,
                },
            },
        });

        if (reading.reactivePowerAverage.phaseB) {
            const phaseBValue = convertNumberToBaseAndPow10Exponent(
                reading.reactivePowerAverage.phaseB,
            );

            void this.postMirrorMeterReading({
                mirrorMeterReading: {
                    mRID: this.client.generateMeterReadingMrid(),
                    description: 'Average Reactive Power (VAR) - Phase B',
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
                        flowDirection: FlowDirectionType.Forward,
                        intervalLength: reading.intervalSeconds,
                        phase: PhaseCode.PhaseB,
                        powerOfTenMultiplier: phaseBValue.pow10,
                        uom: UomType.var,
                    },
                },
            });
        }

        if (reading.reactivePowerAverage.phaseC) {
            const phaseCValue = convertNumberToBaseAndPow10Exponent(
                reading.reactivePowerAverage.phaseC,
            );

            void this.postMirrorMeterReading({
                mirrorMeterReading: {
                    mRID: this.client.generateMeterReadingMrid(),
                    description: 'Average Reactive Power (VAR) - Phase C',
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
                        flowDirection: FlowDirectionType.Forward,
                        intervalLength: reading.intervalSeconds,
                        phase: PhaseCode.PhaseC,
                        powerOfTenMultiplier: phaseCValue.pow10,
                        uom: UomType.var,
                    },
                },
            });
        }
    }

    private postVoltageAverage({
        reading,
        lastUpdateTime,
        nextUpdateTime,
    }: {
        reading: SiteReading;
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
                    flowDirection: FlowDirectionType.Forward,
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
                        flowDirection: FlowDirectionType.Forward,
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
                        flowDirection: FlowDirectionType.Forward,
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
        reading: SiteReading;
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
                    flowDirection: FlowDirectionType.Forward,
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
                    flowDirection: FlowDirectionType.Forward,
                    intervalLength: reading.intervalSeconds,
                    phase: PhaseCode.NotApplicable,
                    powerOfTenMultiplier: minimumValue.pow10,
                    uom: UomType.Hz,
                },
            },
        });
    }

    private getReadingFromSamples(
        samples: SiteMonitoringSimple[],
    ): SiteReading {
        return {
            intervalSeconds: getSamplesIntervalSeconds(samples),
            realPowerAverage: {
                phaseA: averageNumbersArray(
                    samples.map((s) => s.site.realPower.phaseA),
                ),
                phaseB: averageNumbersNullableArray(
                    samples.map((s) => s.site.realPower.phaseB),
                ),
                phaseC: averageNumbersNullableArray(
                    samples.map((s) => s.site.realPower.phaseC),
                ),
            },
            reactivePowerAverage: {
                phaseA: averageNumbersArray(
                    samples.map((s) => s.site.reactivePower.phaseA),
                ),
                phaseB: averageNumbersNullableArray(
                    samples.map((s) => s.site.reactivePower.phaseB),
                ),
                phaseC: averageNumbersNullableArray(
                    samples.map((s) => s.site.reactivePower.phaseC),
                ),
            },
            voltageAverage: {
                phaseA: averageNumbersArray(
                    samples.map((s) => s.site.voltage.phaseA),
                ),
                phaseB: averageNumbersNullableArray(
                    samples.map((s) => s.site.voltage.phaseB),
                ),
                phaseC: averageNumbersNullableArray(
                    samples.map((s) => s.site.voltage.phaseC),
                ),
            },
            frequency: {
                maximum: Math.max(...samples.map((s) => s.site.frequency)),
                minimum: Math.min(...samples.map((s) => s.site.frequency)),
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

        const response = await this.client.post(
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

        await this.client.post(this.mirrorUsagePoint.href, xml);
    }
}
