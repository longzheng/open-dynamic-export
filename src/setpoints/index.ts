import { type Config, type SetpointKeys } from '../helpers/config.js';
import { FixedSetpoint } from './fixed/index.js';
import { type SetpointType } from './setpoint.js';
import { MqttSetpoint } from './mqtt/index.js';
import { AmberSetpoint } from './negativeFeedIn/amber/index.js';
import { AusgridEA029Setpoint } from './twoWayTariff/ausgridEA029/index.js';
import { SapnRELE2WSetpoint } from './twoWayTariff/sapnRELE2W/index.js';
import { type Sep2Instance } from '../sep2/index.js';

export type Setpoints = Record<SetpointKeys, SetpointType | null>;

export function getSetpoints({
    config,
    sep2Instance,
}: {
    config: Config;
    sep2Instance: Sep2Instance | null;
}): Setpoints {
    return {
        csipAus: sep2Instance?.setpoint ?? null,
        fixed: config.setpoints.fixed
            ? new FixedSetpoint({ config: config.setpoints.fixed })
            : null,
        negativeFeedIn:
            config.setpoints.negativeFeedIn?.type === 'amber'
                ? new AmberSetpoint({
                      apiKey: config.setpoints.negativeFeedIn.apiKey,
                      siteId: config.setpoints.negativeFeedIn.siteId,
                  })
                : null,
        twoWayTariff: (() => {
            switch (config.setpoints.twoWayTariff?.type) {
                case 'ausgridEA029':
                    return new AusgridEA029Setpoint();
                case 'sapnRELE2W':
                    return new SapnRELE2WSetpoint();
                case undefined:
                    return null;
            }
        })(),
        mqtt: config.setpoints.mqtt
            ? new MqttSetpoint({ config: config.setpoints.mqtt })
            : null,
    };
}

export function destroySetpoints(setpoints: Setpoints): void {
    Object.values(setpoints).forEach((setpoint) => {
        setpoint?.destroy();
    });
}
