import type { Coordinator } from '../../coordinator/index.js';
import { createCoordinator } from '../../coordinator/index.js';
import type { Result } from '../../helpers/result.js';
import type { InverterData } from '../../inverter/inverterData.js';

export type CoordinatorResponse =
    | {
          running: true;
          invertersDataCache: Result<InverterData>[] | null;
          derSample: DerSample | null;
          siteSample: SiteSample | null;
      }
    | {
          running: false;
      };

class CoordinatorService {
    private coordinator: Coordinator | null = null;

    constructor() {
        this.coordinator = createCoordinator();
    }

    public status(): CoordinatorResponse {
        if (!this.coordinator) {
            return {
                running: false,
            };
        }

        return {
            running: true,
            derSample: this.coordinator.invertersPoller.getDerSampleCache,
            siteSample: this.coordinator.siteSamplePoller.getSiteSampleCache,
            invertersDataCache:
                this.coordinator.invertersPoller.getInvertersDataCache,
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

// workaround tsoa type issue with zod infer types
type DerSample = {
    date: Date;
    realPower:
        | {
              type: 'perPhaseNet';
              phaseA: number;
              phaseB: number | null;
              phaseC: number | null;
              net: number;
          }
        | {
              type: 'noPhase';
              net: number;
          };
    reactivePower:
        | {
              type: 'perPhaseNet';
              phaseA: number;
              phaseB: number | null;
              phaseC: number | null;
              net: number;
          }
        | {
              type: 'noPhase';
              net: number;
          };
    voltage: {
        type: 'perPhase';
        phaseA: number;
        phaseB: number | null;
        phaseC: number | null;
    } | null;
    frequency: number | null;
};

type SiteSample = {
    date: Date;
    realPower:
        | {
              type: 'perPhaseNet';
              phaseA: number;
              phaseB: number | null;
              phaseC: number | null;
              net: number;
          }
        | {
              type: 'noPhase';
              net: number;
          };
    reactivePower:
        | {
              type: 'perPhaseNet';
              phaseA: number;
              phaseB: number | null;
              phaseC: number | null;
              net: number;
          }
        | {
              type: 'noPhase';
              net: number;
          };
    voltage: {
        type: 'perPhase';
        phaseA: number;
        phaseB: number | null;
        phaseC: number | null;
    };
    frequency: number | null;
};
