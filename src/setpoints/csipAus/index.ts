import { type Logger } from 'pino';
import {
    type InverterControlLimit,
    type SupportedControlTypes,
} from '../../coordinator/helpers/inverterController.js';
import { type RampRateHelper } from '../../sep2/helpers/rampRate.js';
import { type SEP2Client } from '../../sep2/client.js';
import { ControlSchedulerHelper } from '../../sep2/helpers/controlScheduler.js';
import { pinoLogger } from '../../helpers/logger.js';
import { type DerControlsHelperChangedData } from '../../sep2/helpers/derControls.js';
import { type SetpointType } from '../setpoint.js';
import { numberWithPow10 } from '../../helpers/number.js';
import { writeControlLimit } from '../../helpers/influxdb.js';
import { type ControlLimitRampTarget } from '../../sep2/helpers/controlLimitRamp.js';
import { ControlLimitRampHelper } from '../../sep2/helpers/controlLimitRamp.js';
import { type Config } from '../../helpers/config.js';

export class CsipAusSetpoint implements SetpointType {
    private schedulerByControlType: {
        [T in SupportedControlTypes]: ControlSchedulerHelper<T>;
    };
    private opModExpLimWRampRateHelper: ControlLimitRampHelper;
    private opModGenLimWRampRateHelper: ControlLimitRampHelper;
    private opModImpLimWRampRateHelper: ControlLimitRampHelper;
    private opModLoadLimWRampRateHelper: ControlLimitRampHelper;
    private logger: Logger;
    private config: Config;

    constructor({
        client,
        rampRateHelper,
        config,
    }: {
        client: SEP2Client;
        rampRateHelper: RampRateHelper;
        config: Config;
    }) {
        this.config = config;
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
            ((): ControlLimitRampTarget => {
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
                        return {
                            type: 'none',
                            value: this.config.setpoints.csipAus?.fixedDefault
                                ?.exportLimitWatts,
                        };
                }
            })(),
        );

        const opModGenLimW =
            this.schedulerByControlType.opModGenLimW.getActiveScheduleDerControlBaseValue();

        this.opModGenLimWRampRateHelper.updateTarget(
            ((): ControlLimitRampTarget => {
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
                        return { type: 'none', value: undefined };
                }
            })(),
        );

        const opModImpLimW =
            this.schedulerByControlType.opModImpLimW.getActiveScheduleDerControlBaseValue();

        this.opModImpLimWRampRateHelper.updateTarget(
            ((): ControlLimitRampTarget => {
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
                        return {
                            type: 'none',
                            value: this.config.setpoints.csipAus?.fixedDefault
                                ?.importLimitWatts,
                        };
                }
            })(),
        );

        const opModLoadLimW =
            this.schedulerByControlType.opModLoadLimW.getActiveScheduleDerControlBaseValue();

        this.opModLoadLimWRampRateHelper.updateTarget(
            ((): ControlLimitRampTarget => {
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
                        return { type: 'none', value: undefined };
                }
            })(),
        );

        const limit: InverterControlLimit = {
            source: 'csipAus',
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

    destroy(): void {
        // no op
    }
}
