import {
    type ActiveInverterControlLimit,
    type InverterConfiguration,
    type InverterControlLimit,
} from '../../coordinator/helpers/inverterController.js';
import { type Coordinator } from '../../coordinator/index.js';
import { createCoordinator } from '../../coordinator/index.js';
import { type Result } from '../../helpers/result.js';
import { type InverterData } from '../../inverter/inverterData.js';

type InvertersDataCache = Result<InverterData>[];

type CoordinatorResponse =
    | {
          running: true;
          invertersDataCache: InvertersDataCache | null;
          derSample: DerSample | null;
          siteSample: SiteSample | null;
          loadWatts: number | null;
          controlLimits: {
              controlLimitsByLimiter: ControlLimitsByLimiter;
              activeInverterControlLimit: ActiveInverterControlLimit;
          } | null;
          inverterConfiguration: InverterConfiguration | null;
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
            loadWatts: this.coordinator.inverterController.getLoadWatts,
            controlLimits: this.coordinator.inverterController.getControlLimits,
            inverterConfiguration:
                this.coordinator.inverterController
                    .getLastAppliedInverterConfiguration,
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

    public getLimiters() {
        if (!this.coordinator) {
            throw new Error('Coordinator is not running');
        }

        return this.coordinator.limiters;
    }
}

export const coordinatorService = new CoordinatorService();

// workaround tsoa type issue with zod infer types
type DerSample = {
    date: Date;
    realPower:
        | {
              type: 'perPhaseNet';
              phaseA: number | null;
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
              phaseA: number | null;
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
        phaseA: number | null;
        phaseB: number | null;
        phaseC: number | null;
    } | null;
    frequency: number | null;
    nameplate: {
        type: number;
        maxW: number;
        maxVA: number;
        maxVar: number;
    };
    settings: {
        setMaxW: number;
        setMaxVA: number | null;
        setMaxVar: number | null;
    };
    status: {
        operationalModeStatus: number;
        genConnectStatus: number;
    };
};

type SiteSample = {
    date: Date;
    realPower:
        | {
              type: 'perPhaseNet';
              phaseA: number | null;
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
              phaseA: number | null;
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
        phaseA: number | null;
        phaseB: number | null;
        phaseC: number | null;
    };
    frequency: number | null;
};

type ControlLimitsByLimiter = Record<
    'csipAus' | 'fixed' | 'negativeFeedIn' | 'twoWayTariff' | 'mqtt',
    InverterControlLimit | null
>;
