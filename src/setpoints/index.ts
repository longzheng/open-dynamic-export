import type { Config } from '../helpers/config.js';
import { CsipAusSetpoint } from './csipAus/index.js';
import { FixedSetpoint } from './fixed/index.js';
import { MqttSetpoint } from './mqtt/index.js';
import { AmberSetpoint } from './negativeFeedIn/amber/index.js';
import { AusgridEA029Setpoint } from './twoWayTariff/ausgridEA029/index.js';
import { SapnRELE2WSetpoint } from './twoWayTariff/sapnRELE2W/index.js';

export type Setpoints = {
    csipAus: CsipAusSetpoint | null;
    fixed: FixedSetpoint | null;
    negativeFeedIn: AmberSetpoint | null;
    twoWayTariff: AusgridEA029Setpoint | SapnRELE2WSetpoint | null;
    mqtt: MqttSetpoint | null;
};

export function getSetpoints({ config }: { config: Config }): Setpoints {
    return {
        csipAus: config.setpoints.csipAus
            ? new CsipAusSetpoint({
                  csipAusConfig: config.setpoints.csipAus,
              })
            : null,
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
