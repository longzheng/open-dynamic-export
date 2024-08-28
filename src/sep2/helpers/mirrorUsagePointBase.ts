import { parseStringPromise } from 'xml2js';
import { getMillisecondsToNextHourMinutesInterval } from '../../helpers/time';
import type { SEP2Client } from '../client';
import { defaultPollPushRates } from '../client';
import type { MirrorMeterReading } from '../models/mirrorMeterReading';
import { generateMirrorMeterReadingResponse } from '../models/mirrorMeterReading';
import type { MirrorUsagePoint } from '../models/mirrorUsagePoint';
import {
    MirrorUsagePointStatus,
    generateMirrorUsagePointResponse,
    parseMirrorUsagePointXmlObject,
} from '../models/mirrorUsagePoint';
import type { RoleFlagsType } from '../models/roleFlagsType';
import { ServiceKind } from '../models/serviceKind';
import { objectToXml } from './xml';
import type { Logger } from 'pino';

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
                point.status === MirrorUsagePointStatus.On &&
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
                status: MirrorUsagePointStatus.On,
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
            } catch (error) {
                this.logger.error(
                    { error },
                    'Error posting one of MirrorMeterReading during scheduled pushing',
                );
            }
        }
    }

    protected abstract postRealPowerAverage({
        reading,
        lastUpdateTime,
        nextUpdateTime,
    }: {
        reading: Reading;
        lastUpdateTime: Date;
        nextUpdateTime: Date;
    }): void;

    protected abstract postReactivePowerAverage({
        reading,
        lastUpdateTime,
        nextUpdateTime,
    }: {
        reading: Reading;
        lastUpdateTime: Date;
        nextUpdateTime: Date;
    }): void;

    protected abstract postVoltageAverage({
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

    protected async postMirrorUsagePoint({
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

    protected async postMirrorMeterReading({
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
