import { type Logger } from 'pino';
import {
    type InverterControlLimit,
    type SupportedControlTypes,
} from '../../coordinator/helpers/inverterController.js';
import { type RampRateHelper } from '../../sep2/helpers/rampRate.js';
import { type SEP2Client } from '../../sep2/client.js';
import { ControlSchedulerHelper } from '../../sep2/helpers/controlScheduler.js';
import { logger as pinoLogger } from '../../helpers/logger.js';
import { type DerControlsHelperChangedData } from '../../sep2/helpers/derControls.js';
import { type LimiterType } from '../limiter.js';
import { numberWithPow10 } from '../../helpers/number.js';
import { writeControlLimit } from '../../helpers/influxdb.js';
import { ControlLimitRampHelper } from '../../sep2/helpers/controlLimitRamp.js';

export class Sep2Limiter implements LimiterType {
    private schedulerByControlType: {
        [T in SupportedControlTypes]: ControlSchedulerHelper<T>;
    };
    private opModExpLimWRampRateHelper: ControlLimitRampHelper;
    private opModGenLimWRampRateHelper: ControlLimitRampHelper;
    private opModImpLimWRampRateHelper: ControlLimitRampHelper;
    private opModLoadLimWRampRateHelper: ControlLimitRampHelper;
    private logger: Logger;

    constructor({
        client,
        rampRateHelper,
    }: {
        client: SEP2Client;
        rampRateHelper: RampRateHelper;
    }) {
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
            opModImpLimW: new ControlSchedulerHelper({
                client,
                controlType: 'opModImpLimW',
            }),
            opModLoadLimW: new ControlSchedulerHelper({
                client,
                controlType: 'opModLoadLimW',
            }),
        };

        this.opModExpLimWRampRateHelper = new ControlLimitRampHelper({
            rampRateHelper,
        });

        this.opModGenLimWRampRateHelper = new ControlLimitRampHelper({
            rampRateHelper,
        });

        this.opModImpLimWRampRateHelper = new ControlLimitRampHelper({
            rampRateHelper,
        });

        this.opModLoadLimWRampRateHelper = new ControlLimitRampHelper({
            rampRateHelper,
        });
    }

    getSchedulerByControlType() {
        return this.schedulerByControlType;
    }

    updateSep2ControlsData(data: DerControlsHelperChangedData) {
        for (const scheduler of Object.values(this.schedulerByControlType)) {
            scheduler.updateControlsData(data);
        }
    }

    getInverterControlLimit(): InverterControlLimit {
        const opModExpLimW =
            this.schedulerByControlType.opModExpLimW.getActiveScheduleDerControlBaseValue();

        this.opModExpLimWRampRateHelper.updateTarget(
            (() => {
                switch (opModExpLimW.type) {
                    case 'active':
                    case 'default': {
                        return {
                            type: opModExpLimW.type,
                            value: opModExpLimW.control
                                ? numberWithPow10(
                                      opModExpLimW.control.value,
                                      opModExpLimW.control.multiplier,
                                  )
                                : undefined,
                            rampTimeSeconds: opModExpLimW.rampTms,
                        };
                    }
                    case 'none':
                        return { type: 'none' };
                }
            })(),
        );

        const opModGenLimW =
            this.schedulerByControlType.opModGenLimW.getActiveScheduleDerControlBaseValue();

        this.opModGenLimWRampRateHelper.updateTarget(
            (() => {
                switch (opModGenLimW.type) {
                    case 'active':
                    case 'default': {
                        return {
                            type: opModGenLimW.type,
                            value: opModGenLimW.control
                                ? numberWithPow10(
                                      opModGenLimW.control.value,
                                      opModGenLimW.control.multiplier,
                                  )
                                : undefined,
                            rampTimeSeconds: opModGenLimW.rampTms,
                        };
                    }
                    case 'none':
                        return { type: 'none' };
                }
            })(),
        );

        const opModImpLimW =
            this.schedulerByControlType.opModImpLimW.getActiveScheduleDerControlBaseValue();

        this.opModImpLimWRampRateHelper.updateTarget(
            (() => {
                switch (opModImpLimW.type) {
                    case 'active':
                    case 'default': {
                        return {
                            type: opModImpLimW.type,
                            value: opModImpLimW.control
                                ? numberWithPow10(
                                      opModImpLimW.control.value,
                                      opModImpLimW.control.multiplier,
                                  )
                                : undefined,
                            rampTimeSeconds: opModImpLimW.rampTms,
                        };
                    }
                    case 'none':
                        return { type: 'none' };
                }
            })(),
        );

        const opModLoadLimW =
            this.schedulerByControlType.opModLoadLimW.getActiveScheduleDerControlBaseValue();

        this.opModLoadLimWRampRateHelper.updateTarget(
            (() => {
                switch (opModLoadLimW.type) {
                    case 'active':
                    case 'default': {
                        return {
                            type: opModLoadLimW.type,
                            value: opModLoadLimW.control
                                ? numberWithPow10(
                                      opModLoadLimW.control.value,
                                      opModLoadLimW.control.multiplier,
                                  )
                                : undefined,
                            rampTimeSeconds: opModLoadLimW.rampTms,
                        };
                    }
                    case 'none':
                        return { type: 'none' };
                }
            })(),
        );

        const limit: InverterControlLimit = {
            source: 'sep2',
            opModExpLimW: this.opModExpLimWRampRateHelper.getRampedValue(),
            opModGenLimW: this.opModGenLimWRampRateHelper.getRampedValue(),
            opModEnergize:
                this.schedulerByControlType.opModEnergize.getActiveScheduleDerControlBaseValue()
                    .control,
            opModConnect:
                this.schedulerByControlType.opModConnect.getActiveScheduleDerControlBaseValue()
                    .control,
            opModImpLimW: this.opModImpLimWRampRateHelper.getRampedValue(),
            opModLoadLimW: this.opModLoadLimWRampRateHelper.getRampedValue(),
        };

        writeControlLimit({ limit });

        return limit;
    }
}
