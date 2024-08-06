import { type SunSpecTelemetry } from './sunspec';

export class TelemetryCache {
    private cacheList: SunSpecTelemetry[] = [];

    public addToCache(telemetry: SunSpecTelemetry) {
        this.cacheList.push(telemetry);
    }

    public getCacheAndClear(): SunSpecTelemetry[] {
        const cache = this.cacheList;
        this.cacheList = [];
        return cache;
    }
}
