import { type MonitoringSample } from './sample';
import { generateMonitoringReading } from './reading';
import type { PostRate } from '../../sep2/models/postRate';
import { defaultPollPushRates } from '../../sep2/client';
import { getMillisecondsToNextHourMinutesInterval } from '../../time';

export class MonitoringHelper {
    private samples: MonitoringSample[] = [];
    private postRate: PostRate | null = null;

    constructor() {}

    public initialise() {
        // set up postRate
        // create MirrroUsagePoints for metrics
        // start post
    }

    public post() {
        const samples = this.getSamplesAndClear();
        const reading = generateMonitoringReading(samples);

        // send data

        // set up next interval
        setTimeout(
            () => {
                this.post();
            },
            getMillisecondsToNextHourMinutesInterval(
                // convert seconds to minutes
                (this.postRate ?? defaultPollPushRates.mirrorUsagePointPush) /
                    60,
            ),
        );
    }

    public addSample(sample: MonitoringSample) {
        this.samples.push(sample);
    }

    private getSamplesAndClear(): MonitoringSample[] {
        const cache = this.samples;
        this.samples = [];
        return cache;
    }
}
