import type { Logger } from 'pino';
import type {
    ActiveDERControlBaseValues,
    SupportedControlTypes,
} from '../../coordinator/helpers/inverterController';
import type { RampRateHelper } from '../../coordinator/helpers/rampRate';
import type { SEP2Client } from '../client';
import { ControlSchedulerHelper } from './controlScheduler';
import { logger as pinoLogger } from '../../helpers/logger';
import type { DerControlsHelperChangedData } from './derControls';
import EventEmitter from 'events';
import type { ControlSystemBase } from '../../coordinator/helpers/controlSystemBase';

export class ControlsScheduler
    extends EventEmitter<{
        changed: [];
    }>
    implements ControlSystemBase
{
    private schedulerByControlType: {
        [T in SupportedControlTypes]: ControlSchedulerHelper<T>;
    };
    private logger: Logger;

    constructor({
        client,
        rampRateHelper,
    }: {
        client: SEP2Client;
        rampRateHelper: RampRateHelper;
    }) {
        super();

        this.logger = pinoLogger.child({ module: 'InverterController' });

        this.schedulerByControlType = {
            opModExpLimW: new ControlSchedulerHelper({
                client,
                controlType: 'opModExpLimW',
                rampRateHelper,
            }),
            opModEnergize: new ControlSchedulerHelper({
                client,
                controlType: 'opModEnergize',
                rampRateHelper,
            }),
            opModConnect: new ControlSchedulerHelper({
                client,
                controlType: 'opModConnect',
                rampRateHelper,
            }),
            opModGenLimW: new ControlSchedulerHelper({
                client,
                controlType: 'opModGenLimW',
                rampRateHelper,
            }),
        };
    }

    updateSep2ControlsData(data: DerControlsHelperChangedData) {
        for (const scheduler of Object.values(this.schedulerByControlType)) {
            scheduler.updateControlsData(data);
        }

        this.emit('changed');
    }

    getActiveDerControlBaseValues(): ActiveDERControlBaseValues {
        return {
            opModExpLimW:
                this.schedulerByControlType.opModExpLimW.getActiveScheduleDerControlBaseValue(),
            opModGenLimW:
                this.schedulerByControlType.opModGenLimW.getActiveScheduleDerControlBaseValue(),
            opModEnergize:
                this.schedulerByControlType.opModEnergize.getActiveScheduleDerControlBaseValue(),
            opModConnect:
                this.schedulerByControlType.opModConnect.getActiveScheduleDerControlBaseValue(),
        };
    }
}
