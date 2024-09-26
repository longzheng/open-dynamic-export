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
import { numberWithPow10 } from '../../helpers/number.js';
import type { SampleBase } from '../../coordinator/helpers/sampleBase.js';
import { getSampleTimePeriod } from '../../coordinator/helpers/sampleBase.js';
import { objectEntriesWithType } from '../../helpers/object.js';
import { addMilliseconds } from 'date-fns';
import axiosRetry from 'axios-retry';

export type MirrorMeterReadingDefinitions = Required<
    Pick<MirrorMeterReading, 'description'> & {
        ReadingType: Required<
            Pick<
                NonNullable<MirrorMeterReading['ReadingType']>,
                | 'commodity'
                | 'kind'
                | 'dataQualifier'
                | 'flowDirection'
                | 'phase'
                | 'powerOfTenMultiplier'
                | 'uom'
            >
        >;
    }
>;

export abstract class MirrorUsagePointHelperBase<
    Sample extends SampleBase,
    Reading,
    MirrorMeterReadingKeys extends string,
> {
    protected client: SEP2Client;
    protected mirrorUsagePointListHref: string | null = null;
    protected mirrorUsagePoint: MirrorUsagePoint | null = null;
    protected samples: Sample[] = [];
    protected abstract description: string;
    protected abstract roleFlags: RoleFlagsType;
    protected mirrorMeterReadingPostTimer: NodeJS.Timeout | null = null;
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

        if (!this.mirrorUsagePoint) {
            // set up MirrorUsagePoint with MirrorMeterReading definitions
            // MirrorUsasgePoint must require at least one MirrorMeterReading definition
            // we define the MirrorMeterReading.ReadingType defintion upfront because they won't change
            // we also want to set this up early so we know the correct postRate (set by the server)
            this.mirrorUsagePoint = await this.postMirrorUsagePoint({
                mirrorUsagePoint: {
                    mRID: this.client.generateUsagePointMrid(this.roleFlags),
                    description: this.description,
                    roleFlags: this.roleFlags,
                    serviceCategoryKind: ServiceKind.Electricity,
                    status: UsagePointBaseStatus.On,
                    deviceLFDI: this.client.lfdi,
                    mirrorMeterReading:
                        this.getMirrorMeterReadingsWithReadingType(),
                },
            });
        }

        const mirrorUsagePoint = mirrorUsagePoints.find(
            (mup) => mup.mRID === this.mirrorUsagePoint!.mRID,
        );

        // the server may change the PostRate of the MirrorUsagePoint
        // update the post rate from polled MirrorUsagePointList data
        if (mirrorUsagePoint) {
            this.mirrorUsagePoint.postRate = mirrorUsagePoint.postRate;
        }

        this.queueMirrorMeterReadingPost();
    }

    public addSample(sample: Sample) {
        this.samples.push(sample);
    }

    protected abstract getReadingFromSamples(samples: Sample[]): Reading;

    protected abstract getReadingMrid(key: MirrorMeterReadingKeys): string;

    protected abstract getReadingDefintions(): Record<
        MirrorMeterReadingKeys,
        MirrorMeterReadingDefinitions
    >;

    protected abstract getReadingValues({
        reading,
    }: {
        reading: Reading;
    }): Record<MirrorMeterReadingKeys, number | null>;

    private getPostRate() {
        return (
            (this.mirrorUsagePoint?.postRate ??
                defaultPollPushRates.mirrorUsagePointPush) / 60
        );
    }

    public async mirrorMeterReadingsPost() {
        // this is a function because we want to evaluate `this.mirrorUsagePoint?.postRate` every time
        // the mirrorUsagePoint may be updated after we post to it so we want to get the latest postRate
        const getNextUpdateMilliseconds = () =>
            getMillisecondsToNextHourMinutesInterval(this.getPostRate());

        const samples = this.getSamplesAndClear();

        // we only want to post if we have samples
        // without samples, the reading values min/max will be infinity
        // we won't know what reading types we have
        if (samples.length > 0) {
            const now = new Date();
            const reading = this.getReadingFromSamples(samples);
            const sampleTimePeriod = getSampleTimePeriod(samples);
            const lastUpdateTime = now;
            const nextUpdateTime = addMilliseconds(
                now,
                getNextUpdateMilliseconds(),
            );
            const mirrorMeterReadings = this.getReadingValues({
                reading,
            });

            const mirrorMeterReadingDefinitions = this.getReadingDefintions();

            await Promise.all(
                objectEntriesWithType(mirrorMeterReadings).map(
                    async ([key, value]) => {
                        // don't post null reading values
                        if (value === null) {
                            return;
                        }

                        return await this.postMirrorMeterReading({
                            mirrorMeterReading: {
                                mRID: this.getReadingMrid(key),
                                description:
                                    mirrorMeterReadingDefinitions[key]
                                        .description,
                                lastUpdateTime,
                                nextUpdateTime,
                                Reading: {
                                    // the value must not contain a decimal point
                                    // shift the base value by the power of 10 multiplier
                                    value: Math.round(
                                        numberWithPow10(
                                            value,
                                            -mirrorMeterReadingDefinitions[key]
                                                .ReadingType
                                                .powerOfTenMultiplier,
                                        ),
                                    ),

                                    timePeriod: {
                                        start: sampleTimePeriod.start,
                                        duration:
                                            sampleTimePeriod.durationSeconds,
                                    },
                                },
                            },
                        });
                    },
                ),
            );

            this.logger.debug('Sent MirrorMeterReadings');
        }

        this.queueMirrorMeterReadingPost();
    }

    private queueMirrorMeterReadingPost() {
        if (this.mirrorMeterReadingPostTimer) {
            clearTimeout(this.mirrorMeterReadingPostTimer);
        }

        this.mirrorMeterReadingPostTimer = setTimeout(() => {
            void this.mirrorMeterReadingsPost();
        }, getMillisecondsToNextHourMinutesInterval(this.getPostRate()));
    }

    private getMirrorMeterReadingsWithReadingType(): Omit<
        MirrorMeterReading,
        'Reading'
    >[] {
        return objectEntriesWithType(this.getReadingDefintions()).map(
            ([key, readingDefinition]): Omit<MirrorMeterReading, 'Reading'> => {
                return {
                    mRID: this.getReadingMrid(key),
                    description: readingDefinition.description,
                    ReadingType: readingDefinition.ReadingType,
                };
            },
        );
    }

    protected getSamplesAndClear(): Sample[] {
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

        const response = await this.client.post(
            this.mirrorUsagePoint.href,
            xml,
            {
                'axios-retry': {
                    // by default axios-retry will not retry POST errors
                    // we know these calls are idempotent so we can retry them
                    retryCondition: (error) => {
                        return (
                            axiosRetry.isNetworkError(error) ||
                            axiosRetry.isRetryableError(error)
                        );
                    },
                },
            },
        );

        return response;
    }
}
