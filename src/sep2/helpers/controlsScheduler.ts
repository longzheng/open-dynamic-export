import type { Logger } from 'pino';
import type {
    InverterControlLimit,
    SupportedControlTypes,
} from '../../coordinator/helpers/inverterController';
import type { RampRateHelper } from '../../coordinator/helpers/rampRate';
import type { SEP2Client } from '../client';
import { ControlSchedulerHelper } from './controlScheduler';
import { logger as pinoLogger } from '../../helpers/logger';
import type { DerControlsHelperChangedData } from './derControls';
import EventEmitter from 'events';
import type { InverterControlLimitSystemType } from '../../coordinator/helpers/inverterControlLimitType';
import { numberWithPow10 } from '../../helpers/number';

export class ControlsScheduler
    extends EventEmitter<{
        changed: [];
    }>
    implements InverterControlLimitSystemType
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

    getInverterControlLimit(): InverterControlLimit {
        const opModExpLimW =
            this.schedulerByControlType.opModExpLimW.getActiveScheduleDerControlBaseValue();
        const opModGenLimW =
            this.schedulerByControlType.opModGenLimW.getActiveScheduleDerControlBaseValue();

        return {
            opModExpLimW: opModExpLimW
                ? numberWithPow10(opModExpLimW.value, opModExpLimW.multiplier)
                : undefined,
            opModGenLimW: opModGenLimW
                ? numberWithPow10(opModGenLimW.value, opModGenLimW.multiplier)
                : undefined,
            opModEnergize:
                this.schedulerByControlType.opModEnergize.getActiveScheduleDerControlBaseValue(),
            opModConnect:
                this.schedulerByControlType.opModConnect.getActiveScheduleDerControlBaseValue(),
        };
    }
}
