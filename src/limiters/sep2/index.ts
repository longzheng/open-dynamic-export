import type { Logger } from 'pino';
import type {
    InverterControlLimit,
    SupportedControlTypes,
} from '../../coordinator/helpers/inverterController.js';
import type { RampRateHelper } from '../../sep2/helpers/rampRate.js';
import type { SEP2Client } from '../../sep2/client.js';
import { ControlSchedulerHelper } from '../../sep2/helpers/controlScheduler.js';
import { logger as pinoLogger } from '../../helpers/logger.js';
import type { DerControlsHelperChangedData } from '../../sep2/helpers/derControls.js';
import EventEmitter from 'events';
import type { LimiterType } from '../../coordinator/helpers/limiter.js';
import { numberWithPow10 } from '../../helpers/number.js';
import { writeControlLimit } from '../../helpers/influxdb.js';
import { ControlLimitRampHelper } from '../../sep2/helpers/controlLimitRamp.js';

export class Sep2Limiter
    extends EventEmitter<{
        changed: [];
    }>
    implements LimiterType
{
    private schedulerByControlType: {
        [T in SupportedControlTypes]: ControlSchedulerHelper<T>;
    };
    private opModExpLimWRampRateHelper: ControlLimitRampHelper;
    private opModGenLimWRampRateHelper: ControlLimitRampHelper;
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
            }),
            opModEnergize: new ControlSchedulerHelper({
                client,
                controlType: 'opModEnergize',
            }),
            opModConnect: new ControlSchedulerHelper({
                client,
                controlType: 'opModConnect',
            }),
            opModGenLimW: new ControlSchedulerHelper({
                client,
                controlType: 'opModGenLimW',
            }),
        };

        this.opModExpLimWRampRateHelper = new ControlLimitRampHelper({
            rampRateHelper,
        });

        this.opModGenLimWRampRateHelper = new ControlLimitRampHelper({
            rampRateHelper,
        });
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

        this.opModExpLimWRampRateHelper.updateTarget({
            value: opModExpLimW.control
                ? numberWithPow10(
                      opModExpLimW.control.value,
                      opModExpLimW.control.multiplier,
                  )
                : undefined,
            rampTimeSeconds: opModExpLimW.rampTms,
        });

        const opModGenLimW =
            this.schedulerByControlType.opModGenLimW.getActiveScheduleDerControlBaseValue();

        this.opModGenLimWRampRateHelper.updateTarget({
            value: opModGenLimW.control
                ? numberWithPow10(
                      opModGenLimW.control.value,
                      opModGenLimW.control.multiplier,
                  )
                : undefined,
            rampTimeSeconds: opModGenLimW.rampTms,
        });

        const limit: InverterControlLimit = {
            opModExpLimW: this.opModExpLimWRampRateHelper.getRampedValue(),
            opModGenLimW: this.opModGenLimWRampRateHelper.getRampedValue(),
            opModEnergize:
                this.schedulerByControlType.opModEnergize.getActiveScheduleDerControlBaseValue()
                    .control,
            opModConnect:
                this.schedulerByControlType.opModConnect.getActiveScheduleDerControlBaseValue()
                    .control,
        };

        writeControlLimit({ limit, name: 'sep2' });

        return limit;
    }
}
