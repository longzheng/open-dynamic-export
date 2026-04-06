import type { Logger } from 'pino';
import type {
    InverterControlLimit,
    SupportedControlTypes,
} from '../../coordinator/helpers/inverterController.js';
import type { DerSample } from '../../coordinator/helpers/derSample.js';
import type { Config } from '../../helpers/config.js';
import { env } from '../../helpers/env.js';
import { writeControlLimit } from '../../helpers/influxdb.js';
import { pinoLogger } from '../../helpers/logger.js';
import { numberWithPow10 } from '../../helpers/number.js';
import { getSep2Certificate } from '../../helpers/sep2Cert.js';
import type { SiteSample } from '../../meters/siteSample.js';
import { SEP2Client } from '../../sep2/client.js';
import {
    ControlLimitRampHelper,
    type ControlLimitRampTarget,
} from '../../sep2/helpers/controlLimitRamp.js';
import { ControlSchedulerHelper } from '../../sep2/helpers/controlScheduler.js';
import {
    DerControlsHelper,
    type DerControlsHelperChangedData,
} from '../../sep2/helpers/derControls.js';
import { DerHelper } from '../../sep2/helpers/der.js';
import { DerListHelper } from '../../sep2/helpers/derList.js';
import { DeviceCapabilityHelper } from '../../sep2/helpers/deviceCapability.js';
import { EndDeviceListHelper } from '../../sep2/helpers/endDeviceList.js';
import { FunctionSetAssignmentsListHelper } from '../../sep2/helpers/functionSetAssignmentsList.js';
import { MirrorUsagePointListHelper } from '../../sep2/helpers/mirrorUsagePointList.js';
import { RampRateHelper } from '../../sep2/helpers/rampRate.js';
import { RegistrationHelper } from '../../sep2/helpers/registration.js';
import { TimeHelper } from '../../sep2/helpers/time.js';
import { objectToXml } from '../../sep2/helpers/xml.js';
import { generateConnectionPointResponse } from '../../sep2/models/connectionPoint.js';
import {
    generateEndDeviceResponse,
    parseEndDeviceXml,
} from '../../sep2/models/endDevice.js';
import type { EndDeviceList } from '../../sep2/models/endDeviceList.js';
import type { SetpointType } from '../setpoint.js';

export class CsipAusSetpoint implements SetpointType {
    private schedulerByControlType: {
        [T in SupportedControlTypes]: ControlSchedulerHelper<T>;
    };
    private opModExpLimWRampRateHelper: ControlLimitRampHelper;
    private opModGenLimWRampRateHelper: ControlLimitRampHelper;
    private opModImpLimWRampRateHelper: ControlLimitRampHelper;
    private opModLoadLimWRampRateHelper: ControlLimitRampHelper;
    private logger: Logger;
    private csipAusConfig: NonNullable<Config['setpoints']['csipAus']>;
    private abortController: AbortController;
    private sep2Client: SEP2Client;
    private timeHelper: TimeHelper;
    private endDeviceListHelper: EndDeviceListHelper;
    private registrationHelper: RegistrationHelper;
    private derListHelper: DerListHelper;
    private derHelper: DerHelper;
    private functionSetAssignmentsListHelper: FunctionSetAssignmentsListHelper;
    private mirrorUsagePointListHelper: MirrorUsagePointListHelper;
    private derControlsHelper: DerControlsHelper;
    private deviceCapabilityHelper: DeviceCapabilityHelper;
    private rampRateHelper: RampRateHelper;
    private connected = false;

    constructor({
        csipAusConfig,
    }: {
        csipAusConfig: NonNullable<Config['setpoints']['csipAus']>;
    }) {
        this.csipAusConfig = csipAusConfig;
        this.logger = pinoLogger.child({ module: 'CsipAusSetpoint' });
        this.abortController = new AbortController();
        this.rampRateHelper = new RampRateHelper();

        const sep2Certificate = getSep2Certificate();

        this.sep2Client = new SEP2Client({
            host: this.csipAusConfig.host,
            cert: sep2Certificate.cert,
            key: sep2Certificate.key,
            pen: env.SEP2_PEN,
        });

        this.timeHelper = new TimeHelper({
            client: this.sep2Client,
        });

        this.endDeviceListHelper = new EndDeviceListHelper({
            client: this.sep2Client,
        });

        this.registrationHelper = new RegistrationHelper({
            client: this.sep2Client,
        });

        this.derListHelper = new DerListHelper({
            client: this.sep2Client,
        });

        this.derHelper = new DerHelper({
            client: this.sep2Client,
            rampRateHelper: this.rampRateHelper,
        });

        this.functionSetAssignmentsListHelper =
            new FunctionSetAssignmentsListHelper({
                client: this.sep2Client,
            });

        this.mirrorUsagePointListHelper = new MirrorUsagePointListHelper({
            client: this.sep2Client,
        });

        this.schedulerByControlType = {
            opModExpLimW: new ControlSchedulerHelper({
                client: this.sep2Client,
                controlType: 'opModExpLimW',
            }),
            opModEnergize: new ControlSchedulerHelper({
                client: this.sep2Client,
                controlType: 'opModEnergize',
            }),
            opModConnect: new ControlSchedulerHelper({
                client: this.sep2Client,
                controlType: 'opModConnect',
            }),
            opModGenLimW: new ControlSchedulerHelper({
                client: this.sep2Client,
                controlType: 'opModGenLimW',
            }),
            opModImpLimW: new ControlSchedulerHelper({
                client: this.sep2Client,
                controlType: 'opModImpLimW',
            }),
            opModLoadLimW: new ControlSchedulerHelper({
                client: this.sep2Client,
                controlType: 'opModLoadLimW',
            }),
        };

        this.opModExpLimWRampRateHelper = new ControlLimitRampHelper({
            rampRateHelper: this.rampRateHelper,
        });

        this.opModGenLimWRampRateHelper = new ControlLimitRampHelper({
            rampRateHelper: this.rampRateHelper,
        });

        this.opModImpLimWRampRateHelper = new ControlLimitRampHelper({
            rampRateHelper: this.rampRateHelper,
        });

        this.opModLoadLimWRampRateHelper = new ControlLimitRampHelper({
            rampRateHelper: this.rampRateHelper,
        });

        this.derControlsHelper = new DerControlsHelper({
            client: this.sep2Client,
        }).on('data', (data) => {
            this.logger.debug(data, 'DER controls data changed');

            this.updateSep2ControlsData(data);

            this.rampRateHelper.setDefaultDERControlRampRate(
                data.fallbackControl.type === 'default'
                    ? (data.fallbackControl.data.defaultControl.setGradW ??
                          null)
                    : null,
            );
        });

        this.endDeviceListHelper.on('data', (endDeviceList) => {
            void (async () => {
                this.logger.debug(
                    { endDeviceList },
                    'Received SEP2 end device list',
                );

                const endDevice = await this.getOrCreateEndDevice({
                    endDeviceList,
                });

                if (endDevice.enabled !== true) {
                    throw new Error('End device is not enabled');
                }

                this.mirrorUsagePointListHelper.updateEndDevice({
                    endDevice,
                });

                if (endDevice.derListLink) {
                    this.derListHelper.updateHref({
                        href: endDevice.derListLink.href,
                    });
                }

                if (endDevice.functionSetAssignmentsListLink) {
                    this.functionSetAssignmentsListHelper.updateHref({
                        href: endDevice.functionSetAssignmentsListLink.href,
                    });
                }

                if (endDevice.connectionPointLink?.href) {
                    await this.putConnectionPointId({
                        connectionPointHref: endDevice.connectionPointLink.href,
                    });
                }

                if (endDevice.registrationLink) {
                    this.registrationHelper.updateHref({
                        href: endDevice.registrationLink.href,
                    });
                }
            })();
        });

        this.derListHelper.on('data', (derList) => {
            this.logger.debug({ derList }, 'Received SEP2 end device DER list');

            if (derList.ders.length !== 1) {
                throw new Error(
                    `DERS list length is not 1, actual length ${derList.ders.length}`,
                );
            }

            const der = derList.ders.at(0)!;

            this.derHelper.configureDer({
                der,
                pollRate: derList.pollRate,
            });
        });

        this.functionSetAssignmentsListHelper.on(
            'data',
            (functionSetAssignmentsList) => {
                this.logger.debug(
                    { functionSetAssignmentsList },
                    'Received SEP2 function set assignments list',
                );

                this.derControlsHelper.updateFsaData(
                    functionSetAssignmentsList,
                );
            },
        );

        this.logger.info('Discovering SEP2');

        this.deviceCapabilityHelper = new DeviceCapabilityHelper({
            client: this.sep2Client,
            href: this.csipAusConfig.dcapUri,
        })
            .on('data', (deviceCapability) => {
                this.updateConnected(true);

                this.logger.debug(
                    { deviceCapability },
                    'Received SEP2 device capability',
                );

                this.timeHelper.updateHref({
                    href: deviceCapability.timeLink.href,
                });

                this.endDeviceListHelper.updateHref({
                    href: deviceCapability.endDeviceListLink.href,
                });

                this.mirrorUsagePointListHelper.updateHref({
                    href: deviceCapability.mirrorUsagePointListLink.href,
                });
            })
            .on('pollError', () => {
                this.updateConnected(false);
            });
    }

    getSchedulerByControlType() {
        return this.schedulerByControlType;
    }

    getStatus() {
        return {
            connected: this.connected,
            lfdi: this.sep2Client.lfdi,
            sfdi: this.sep2Client.sfdi,
        };
    }

    updateSep2ControlsData(data: DerControlsHelperChangedData) {
        for (const scheduler of Object.values(this.schedulerByControlType)) {
            scheduler.updateControlsData(data);
        }
    }

    onDerSample(derSample: DerSample) {
        this.rampRateHelper.onDerSample(derSample);
        this.derHelper.onDerSample(derSample);
        this.mirrorUsagePointListHelper.addDerSample(derSample);
    }

    onSiteSample(siteSample: SiteSample) {
        this.mirrorUsagePointListHelper.addSiteSample(siteSample);
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
                            value: this.csipAusConfig.fixedDefault
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
                            value: this.csipAusConfig.fixedDefault
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

    private async getOrCreateEndDevice({
        endDeviceList,
    }: {
        endDeviceList: EndDeviceList;
    }) {
        // as a direct client, we expect only one end device that matches the LFDI of our certificate
        const endDevice = endDeviceList.endDevices.find(
            (endDevice) =>
                // LFDI should always be uppercase but in case the server returns lowercase
                endDevice.lFDI?.toUpperCase() === this.sep2Client.lfdi &&
                endDevice.enabled === true,
        );

        if (endDevice) {
            return endDevice;
        }

        const endDeviceListHref = endDeviceList.href;
        if (!endDeviceListHref) {
            throw new Error('Missing endDeviceList href');
        }

        return this.postEndDevice({
            endDeviceListHref,
        });
    }

    private async postEndDevice({
        endDeviceListHref,
    }: {
        endDeviceListHref: string;
    }) {
        const data = generateEndDeviceResponse({
            lFDI: this.sep2Client.lfdi,
            sFDI: this.sep2Client.sfdi,
            changedTime: new Date(),
            enabled: true,
        });
        const xml = objectToXml(data);

        const response = await this.sep2Client.post(endDeviceListHref, xml);

        const locationHeader = response.headers['location'] as
            | string
            | undefined;

        if (!locationHeader) {
            throw new Error('Missing location header');
        }

        return parseEndDeviceXml(
            await this.sep2Client.get(locationHeader, {
                signal: this.abortController.signal,
            }),
        );
    }

    private async putConnectionPointId({
        connectionPointHref,
    }: {
        connectionPointHref: string;
    }) {
        const nmi = this.csipAusConfig.nmi;

        if (!nmi) {
            throw new Error(
                'Missing NMI for CSIP-AUS ConnectionPoint in-band registration',
            );
        }

        const data = generateConnectionPointResponse({
            connectionPointId: nmi,
        });
        const xml = objectToXml(data);

        await this.sep2Client.put(connectionPointHref, xml);
    }

    destroy(): void {
        this.logger.info('Destroying CSIP-AUS setpoint');
        this.abortController.abort();
        this.deviceCapabilityHelper.destroy();
        this.timeHelper.destroy();
        this.endDeviceListHelper.destroy();
        this.registrationHelper.destroy();
        this.derListHelper.destroy();
        this.derHelper.destroy();
        this.functionSetAssignmentsListHelper.destroy();
        this.mirrorUsagePointListHelper.destroy();
        this.derControlsHelper.destroy();
    }

    private updateConnected(connected: boolean) {
        if (this.connected === connected) {
            return;
        }

        this.connected = connected;
        this.logger.info({ connected }, 'CSIP-AUS connected state changed');
    }
}
