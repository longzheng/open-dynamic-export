import { getMillisecondsToNextHourMinutesInterval } from '../../helpers/time.js';
import type { SEP2Client } from '../client.js';
import { defaultPollPushRates } from '../client.js';
import type { MirrorMeterReading } from '../models/mirrorMeterReading.js';
import { generateMirrorMeterReadingResponse } from '../models/mirrorMeterReading.js';
import type { MirrorUsagePoint } from '../models/mirrorUsagePoint.js';
import {
    generateMirrorUsagePointResponse,
    parseMirrorUsagePointXml,
} from '../models/mirrorUsagePoint.js';
import type { RoleFlagsType } from '../models/roleFlagsType.js';
import { ServiceKind } from '../models/serviceKind.js';
import { objectToXml } from './xml.js';
import type { Logger } from 'pino';
import { UsagePointBaseStatus } from '../models/usagePointBase.js';
import { convertNumberToBaseAndPow10Exponent } from '../../helpers/number.js';
import { CommodityType } from '../models/commodityType.js';
import type { DataQualifierType } from '../models/dataQualifierType.js';
import type { FlowDirectionType } from '../models/flowDirectionType.js';
import { KindType } from '../models/kindType.js';
import type { PhaseCode } from '../models/phaseCode.js';
import { QualityFlags } from '../models/qualityFlags.js';
import type { UomType } from '../models/uomType.js';

export abstract class MirrorUsagePointHelperBase<MonitoringSample, Reading> {
    protected client: SEP2Client;
    protected mirrorUsagePointListHref: string | null = null;
    protected mirrorUsagePoint: MirrorUsagePoint | null = null;
    protected samples: MonitoringSample[] = [];
    protected abstract description: string;
    protected abstract roleFlags: RoleFlagsType;
    protected postTimer: NodeJS.Timeout | null = null;
    protected abstract logger: Logger;

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

        // use existing mirrorUsagePoint if it has already been created before
        const existingMirrorUsagePoint = mirrorUsagePoints.find(
            (point) =>
                point.deviceLFDI === this.client.lfdi &&
                point.status === UsagePointBaseStatus.On &&
                point.roleFlags === this.roleFlags,
        );

        if (existingMirrorUsagePoint) {
            this.mirrorUsagePoint = existingMirrorUsagePoint;
            this.startPosting();
            return;
        }

        // if does not exist, create new mirrorUsagePoint
        this.mirrorUsagePoint = await this.postMirrorUsagePoint({
            mirrorUsagePoint: {
                mRID: this.client.generateUsagePointMrid(this.roleFlags),
                description: this.description,
                roleFlags: this.roleFlags,
                serviceCategoryKind: ServiceKind.Electricity,
                status: UsagePointBaseStatus.On,
                deviceLFDI: this.client.lfdi,
            },
        });

        this.startPosting();
    }

    protected startPosting() {
        if (this.postTimer) return;

        void this.post();
    }

    public addSample(sample: MonitoringSample) {
        this.samples.push(sample);
    }

    protected abstract getReadingFromSamples(
        samples: MonitoringSample[],
    ): Reading;

    public post() {
        const nextUpdateMilliseconds = getMillisecondsToNextHourMinutesInterval(
            (this.mirrorUsagePoint?.postRate ??
                defaultPollPushRates.mirrorUsagePointPush) / 60,
        );

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

            try {
                this.postRealPower({
                    reading,
                    lastUpdateTime,
                    nextUpdateTime,
                });

                this.postReactivePower({
                    reading,
                    lastUpdateTime,
                    nextUpdateTime,
                });

                this.postVoltage({
                    reading,
                    lastUpdateTime,
                    nextUpdateTime,
                });

                this.postFrequency({
                    reading,
                    lastUpdateTime,
                    nextUpdateTime,
                });
            } catch (error) {
                this.logger.error(
                    { error },
                    'Error posting one of MirrorMeterReading during scheduled pushing',
                );
            }
        }
    }

    protected abstract postRealPower({
        reading,
        lastUpdateTime,
        nextUpdateTime,
    }: {
        reading: Reading;
        lastUpdateTime: Date;
        nextUpdateTime: Date;
    }): void;

    protected abstract postReactivePower({
        reading,
        lastUpdateTime,
        nextUpdateTime,
    }: {
        reading: Reading;
        lastUpdateTime: Date;
        nextUpdateTime: Date;
    }): void;

    protected abstract postVoltage({
        reading,
        lastUpdateTime,
        nextUpdateTime,
    }: {
        reading: Reading;
        lastUpdateTime: Date;
        nextUpdateTime: Date;
    }): void;

    protected abstract postFrequency({
        reading,
        lastUpdateTime,
        nextUpdateTime,
    }: {
        reading: Reading;
        lastUpdateTime: Date;
        nextUpdateTime: Date;
    }): void;

    protected getSamplesAndClear(): MonitoringSample[] {
        const cache = this.samples;
        this.samples = [];
        return cache;
    }

    protected sendMirrorMeterReading = ({
        phase,
        flowDirection,
        dataQualifier,
        description,
        value,
        uom,
        lastUpdateTime,
        nextUpdateTime,
        intervalLength,
    }: {
        phase: PhaseCode;
        flowDirection: FlowDirectionType;
        dataQualifier: DataQualifierType;
        description: string;
        value: number;
        uom: UomType;
        lastUpdateTime: Date;
        nextUpdateTime: Date;
        intervalLength: number;
    }) => {
        const exponentValue = convertNumberToBaseAndPow10Exponent(value);

        void this.postMirrorMeterReading({
            mirrorMeterReading: {
                mRID: this.client.generateMeterReadingMrid(),
                description,
                lastUpdateTime,
                nextUpdateTime,
                Reading: {
                    value: exponentValue.base,
                    qualityFlags: QualityFlags.Valid,
                },
                ReadingType: {
                    commodity: CommodityType.ElectricitySecondaryMeteredValue,
                    kind: KindType.Power,
                    dataQualifier,
                    flowDirection,
                    intervalLength,
                    phase,
                    powerOfTenMultiplier: exponentValue.pow10,
                    uom,
                },
            },
        });
    };

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

        const locationHeader = response.headers['location'] as
            | string
            | undefined;

        if (!locationHeader) {
            throw new Error('Missing location header');
        }

        return parseMirrorUsagePointXml(await this.client.get(locationHeader));
    }

    private async postMirrorMeterReading({
        mirrorMeterReading,
    }: {
        mirrorMeterReading: MirrorMeterReading;
    }) {
        if (!this.mirrorUsagePoint || !this.mirrorUsagePoint.href) {
            throw new Error('Missing mirrorUsagePoint or its href');
        }

        const data = generateMirrorMeterReadingResponse(mirrorMeterReading);
        const xml = objectToXml(data);

        await this.client.post(this.mirrorUsagePoint.href, xml);
    }
}
