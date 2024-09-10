import type { Coordinator } from '../../coordinator/index.js';
import { createCoordinator } from '../../coordinator/index.js';

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
}

export const coordinatorService = new CoordinatorService();
