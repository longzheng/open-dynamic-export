import { getMillisecondsToNextHourMinutesInterval } from '../../helpers/time.js';
import { type SEP2Client } from '../client.js';
import { defaultPollPushRates } from '../client.js';
import { type MirrorMeterReading } from '../models/mirrorMeterReading.js';
import { generateMirrorMeterReadingResponse } from '../models/mirrorMeterReading.js';
import { type MirrorUsagePoint } from '../models/mirrorUsagePoint.js';
import {
    generateMirrorUsagePointResponse,
    parseMirrorUsagePointXml,
} from '../models/mirrorUsagePoint.js';
import { type RoleFlagsType } from '../models/roleFlagsType.js';
import { ServiceKind } from '../models/serviceKind.js';
import { objectToXml } from './xml.js';
import { type Logger } from 'pino';
import { numberWithPow10 } from '../../helpers/number.js';
import { type SampleBase } from '../../coordinator/helpers/sampleBase.js';
import { getSampleTimePeriod } from '../../coordinator/helpers/sampleBase.js';
import { objectEntriesWithType } from '../../helpers/object.js';
import { addMilliseconds } from 'date-fns';
import { isNetworkError, isRetryableError } from 'axios-retry';
import { CappedArrayStack } from '../../helpers/cappedArrayStack.js';
import { UsagePointBaseStatus } from '../models/usagePointBaseStatus.js';

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
    private mirrorMeterReadingsBuffer: CappedArrayStack<MirrorMeterReading> =
        new CappedArrayStack({ limit: 1000 });
    private abortController: AbortController;

    constructor({ client }: { client: SEP2Client }) {
        this.client = client;
        this.abortController = new AbortController();
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
            await this.initMirrorUsagePoint();
        }

        const currentMirrorUsagePoint = this.mirrorUsagePoint;

        if (currentMirrorUsagePoint) {
            const serverMirrorUsagePoint = mirrorUsagePoints.find(
                (mup) => mup.mRID === currentMirrorUsagePoint.mRID,
            );

            // the server may change the PostRate of the MirrorUsagePoint
            // update the post rate from polled MirrorUsagePointList data
            if (serverMirrorUsagePoint) {
                currentMirrorUsagePoint.postRate =
                    serverMirrorUsagePoint.postRate;
            }
        }

        this.queueMirrorMeterReadingPost();
    }

    private async initMirrorUsagePoint() {
        const mirrorUsagePoint: MirrorUsagePoint = {
            mRID: this.client.generateUsagePointMrid(this.roleFlags),
            description: this.description,
            roleFlags: this.roleFlags,
            serviceCategoryKind: ServiceKind.Electricity,
            status: UsagePointBaseStatus.On,
            deviceLFDI: this.client.lfdi,
            mirrorMeterReading: this.getMirrorMeterReadingsWithReadingType(),
        };

        this.logger.debug({ mirrorUsagePoint }, 'Creating MirrorUsagePoint');

        // set up MirrorUsagePoint with MirrorMeterReading definitions
        // MirrorUsagePoint must require at least one MirrorMeterReading definition
        // we define the MirrorMeterReading.ReadingType definition upfront because they won't change
        // we also want to set this up early so we know the correct postRate (set by the server)
        this.mirrorUsagePoint = await this.postMirrorUsagePoint({
            mirrorUsagePoint,
        });
    }

    public addSample(sample: Sample) {
        this.samples.push(sample);
    }

    public destroy() {
        this.abortController.abort();

        if (this.mirrorMeterReadingPostTimer) {
            clearTimeout(this.mirrorMeterReadingPostTimer);
        }
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
        // send any buffered readings
        if (this.mirrorMeterReadingsBuffer.get().length > 0) {
            const bufferedReadings = this.mirrorMeterReadingsBuffer.get();

            this.mirrorMeterReadingsBuffer.clear();

            const bufferedResult = await this.sendReadings(bufferedReadings);

            this.logger.debug(
                {
                    bufferedResult,
                },
                'Sent buffered MirrorMeterReadings',
            );
        }

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

            const readings = objectEntriesWithType(mirrorMeterReadings)
                .map(([key, value]): MirrorMeterReading | null => {
                    // don't post null reading values
                    if (value === null) {
                        return null;
                    }

                    return {
                        mRID: this.getReadingMrid(key),
                        description:
                            mirrorMeterReadingDefinitions[key].description,
                        lastUpdateTime,
                        nextUpdateTime,
                        Reading: {
                            // the value must not contain a decimal point
                            // shift the base value by the power of 10 multiplier
                            value: Math.round(
                                numberWithPow10(
                                    value,
                                    -mirrorMeterReadingDefinitions[key]
                                        .ReadingType.powerOfTenMultiplier,
                                ),
                            ),

                            timePeriod: {
                                start: sampleTimePeriod.start,
                                duration: sampleTimePeriod.durationSeconds,
                            },
                        },
                    };
                })
                .filter((reading) => reading !== null);

            const result = await this.sendReadings(readings);

            this.logger.debug(
                {
                    result,
                },
                'Sent MirrorMeterReadings',
            );
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
            {
                signal: this.abortController.signal,
            },
        );

        const locationHeader = response.headers['location'] as
            | string
            | undefined;

        if (!locationHeader) {
            throw new Error('Missing location header');
        }

        return parseMirrorUsagePointXml(
            await this.client.get(locationHeader, {
                signal: this.abortController.signal,
            }),
        );
    }

    private async sendReadings(readings: MirrorMeterReading[]): Promise<{
        successCount: number;
        failCount: number;
    }> {
        let successCount = 0;
        let failCount = 0;

        await Promise.all(
            readings.map(async (reading) => {
                try {
                    await this.postMirrorMeterReading({
                        mirrorMeterReading: reading,
                    });
                    successCount++;
                } catch (error) {
                    this.logger.debug(
                        error,
                        'Failed to post MirrorMeterReading',
                    );
                    failCount++;
                    this.mirrorMeterReadingsBuffer.push(reading);

                    // Energex has indicated that a MUP might get deleted
                    // "We won’t delete the MUP generally – but when we do a server reset everything in the DB can get reset and so all end points mappings should be considered ephemeral.
                    // (Although no need to check every time – only if you get an error)"
                    // on an error, try re-create the MUP as a precaution
                    await this.initMirrorUsagePoint();
                }
            }),
        );

        return {
            successCount,
            failCount,
        };
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
                        return isNetworkError(error) || isRetryableError(error);
                    },
                },
                signal: this.abortController.signal,
            },
        );

        return response;
    }
}
