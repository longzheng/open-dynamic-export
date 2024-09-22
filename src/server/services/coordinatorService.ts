import type { Coordinator } from '../../coordinator/index.js';
import { createCoordinator } from '../../coordinator/index.js';
import type { SiteSampleData } from '../../meters/siteSample.js';
import type { SampleBase } from '../../coordinator/helpers/sampleBase.js';

export type CoordinatorResponse = {
    running: boolean;
};

class CoordinatorService {
    private coordinator: Coordinator | null = null;

    constructor() {
        this.coordinator = createCoordinator();
    }

    public status(): CoordinatorResponse {
        return {
            running: this.coordinator !== null,
        };
    }

    public start() {
        if (this.coordinator) {
            throw new Error('Coordinator is already running');
        }

        this.coordinator = createCoordinator();
    }

    public stop() {
        if (!this.coordinator) {
            throw new Error("Coordinator isn't running");
        }

        this.coordinator.destroy();
        this.coordinator = null;
    }

    public siteSample(): // workaround tsoa type issue with zod
    (SampleBase & SiteSampleData) | null {
        if (!this.coordinator) {
            throw new Error("Coordinator isn't running");
        }

        return this.coordinator.siteSamplePoller.getSiteSampleCache;
    }
}

export const coordinatorService = new CoordinatorService();
