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
import type { LimiterType } from '../limiter.js';
import { numberWithPow10 } from '../../helpers/number.js';
import { writeControlLimit } from '../../helpers/influxdb.js';
import { ControlLimitRampHelper } from '../../sep2/helpers/controlLimitRamp.js';
import {
    cacheFallbackControl,
    getCachedFallbackControl,
    type FallbackControl,
} from '../../sep2/helpers/fallbackControl.js';

export class Sep2Limiter implements LimiterType {
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

        const cachedFallbackControl = getCachedFallbackControl();

        if (cachedFallbackControl) {
            this.updateFallbackControl(cachedFallbackControl);
        }

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

        cacheFallbackControl(data.fallbackControl);
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
        };

        writeControlLimit({ limit });

        return limit;
    }

    private updateFallbackControl(fallbackControl: FallbackControl) {
        for (const scheduler of Object.values(this.schedulerByControlType)) {
            scheduler.updateFallbackControl(fallbackControl);
        }
    }
}
