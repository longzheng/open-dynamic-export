import { enumHasValue } from '../../helpers/enum.js';
import { assertNonNull } from '../../helpers/null.js';
import { ConnectStatus } from '../../sep2/models/connectStatus.js';
import { OperationalModeStatus } from '../../sep2/models/operationModeStatus.js';
import { getInverterMetrics } from '../../sunspec/helpers/inverterMetrics.js';
import { getNameplateMetrics } from '../../sunspec/helpers/nameplateMetrics.js';
import { getSettingsMetrics } from '../../sunspec/helpers/settingsMetrics.js';
import { getStatusMetrics } from '../../sunspec/helpers/statusMetrics.js';
import type { ControlsModel } from '../../sunspec/models/controls.js';
import type { InverterModel } from '../../sunspec/models/inverter.js';
import type { DERTyp, NameplateModel } from '../../sunspec/models/nameplate.js';
import type { SettingsModel } from '../../sunspec/models/settings.js';
import type { StatusModel } from '../../sunspec/models/status.js';
import { PVConn } from '../../sunspec/models/status.js';
import type { DerSample } from './derSample.js';

export type InverterData = {
    inverter: {
        realPower: number;
        reactivePower: number;
        voltagePhaseA: number;
        voltagePhaseB: number | null;
        voltagePhaseC: number | null;
        frequency: number;
    };
    nameplate: {
        type: DERTyp;
        maxW: number;
        maxVA: number;
        maxVar: number;
    };
    settings: {
        maxW: number;
        maxVA: number | null;
        maxVar: number | null;
    };
    status: {
        operationalModeStatus: OperationalModeStatus;
        genConnectStatus: ConnectStatus;
    };
    controls: ControlsModel;
};

export type InvertersPolledData = {
    invertersData: InverterData[];
    derSample: DerSample;
};

export function generateInverterData({
    inverter,
    nameplate,
    settings,
    status,
    controls,
}: {
    inverter: InverterModel;
    nameplate: NameplateModel;
    settings: SettingsModel;
    status: StatusModel;
    controls: ControlsModel;
}): InverterData {
    const inverterMetrics = getInverterMetrics(inverter);
    const nameplateMetrics = getNameplateMetrics(nameplate);
    const settingsMetrics = getSettingsMetrics(settings);

    return {
        inverter: {
            realPower: inverterMetrics.W,
            reactivePower: inverterMetrics.VAr ?? 0,
            voltagePhaseA: assertNonNull(inverterMetrics.PhVphA),
            voltagePhaseB: inverterMetrics.PhVphB,
            voltagePhaseC: inverterMetrics.PhVphC,
            frequency: inverterMetrics.Hz,
        },
        nameplate: {
            type: nameplate.DERTyp,
            maxW: nameplateMetrics.WRtg,
            maxVA: nameplateMetrics.VARtg,
            maxVar: nameplateMetrics.VArRtgQ1,
        },
        settings: {
            maxW: settingsMetrics.WMax,
            maxVA: settingsMetrics.VAMax,
            maxVar: settingsMetrics.VArMaxQ1,
        },
        status: generateInverterDataStatus({ status }),
        controls,
    };
}

export function generateInverterDataStatus({
    status,
}: {
    status: StatusModel;
}): InverterData['status'] {
    const statusMetrics = getStatusMetrics(status);

    return {
        operationalModeStatus: enumHasValue(
            statusMetrics.PVConn,
            PVConn.CONNECTED,
        )
            ? OperationalModeStatus.OperationalMode
            : OperationalModeStatus.Off,
        genConnectStatus: getConnectStatusFromPVConn(statusMetrics.PVConn),
    };
}

export function getConnectStatusFromPVConn(pvConn: PVConn): ConnectStatus {
    let result: ConnectStatus = 0 as ConnectStatus;

    if (enumHasValue(pvConn, PVConn.CONNECTED)) {
        result += ConnectStatus.Connected;
    }

    if (enumHasValue(pvConn, PVConn.AVAILABLE)) {
        result += ConnectStatus.Available;
    }

    if (enumHasValue(pvConn, PVConn.OPERATING)) {
        result += ConnectStatus.Operating;
    }

    if (enumHasValue(pvConn, PVConn.TEST)) {
        result += ConnectStatus.Test;
    }

    return result;
}
