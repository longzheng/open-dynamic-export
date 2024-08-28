import { enumHasValue } from '../../helpers/enum';
import { convertNumberToBaseAndPow10Exponent } from '../../helpers/number';
import { ConnectStatus } from '../../sep2/models/connectStatus';
import type { DERCapability } from '../../sep2/models/derCapability';
import { DERControlType } from '../../sep2/models/derControlType';
import type { DERSettings } from '../../sep2/models/derSettings';
import type { DERStatus } from '../../sep2/models/derStatus';
import { OperationalModeStatus } from '../../sep2/models/derStatus';
import { DERType } from '../../sep2/models/derType';
import { DOEModesSupportedType } from '../../sep2/models/doeModesSupportedType';
import { getAggregatedNameplateMetrics } from '../../sunspec/helpers/nameplateMetrics';
import { getAggregatedSettingsMetrics } from '../../sunspec/helpers/settingsMetrics';
import { getAggregatedStatusMetrics } from '../../sunspec/helpers/statusMetrics';
import { type NameplateModel } from '../../sunspec/models/nameplate';
import type { SettingsModel } from '../../sunspec/models/settings';
import { PVConn, type StatusModel } from '../../sunspec/models/status';
import type { RampRateHelper } from './rampRate';

const derControlTypeModes: DERControlType =
    DERControlType.opModConnect | DERControlType.opModEnergize;

export function getDerCapabilityResponseFromSunSpecArray(
    nameplateModels: NameplateModel[],
): DERCapability {
    const metrics = getAggregatedNameplateMetrics(nameplateModels);
    const rtgMaxVA = convertNumberToBaseAndPow10Exponent(metrics.VARtg);
    const rtgMaxW = convertNumberToBaseAndPow10Exponent(metrics.WRtg);
    const rtgMaxVar = convertNumberToBaseAndPow10Exponent(metrics.VArRtgQ1);

    return {
        // hard-coded modes
        modesSupported: derControlTypeModes,
        // hard-coded DOE modes
        doeModesSupported:
            DOEModesSupportedType.opModExpLimW |
            DOEModesSupportedType.opModGenLimW,
        // assume PV for now
        type: DERType.PhotovoltaicSystem,
        rtgMaxVA: {
            value: rtgMaxVA.base,
            multiplier: rtgMaxVA.pow10,
        },
        rtgMaxVar: {
            value: rtgMaxVar.base,
            multiplier: rtgMaxVar.pow10,
        },
        rtgMaxW: {
            value: rtgMaxW.base,
            multiplier: rtgMaxW.pow10,
        },
        // there's no way to get the nominal voltage from the SunSpec nameplate model
        // VNom is available from the DER Capacity 702 model but it's not widely available
        // https://sunspec.org/wp-content/uploads/2021/02/SunSpec-DER-Information-Model-Specification-V1-0-02-01-2021.pdf
        rtgVNom: undefined,
    };
}

export function getDerSettingsResponseFromSunSpecArray({
    settingsModels,
    rampRateHelper,
}: {
    settingsModels: SettingsModel[];
    rampRateHelper: RampRateHelper;
}): DERSettings {
    const metrics = getAggregatedSettingsMetrics(settingsModels);
    const setMaxVA = metrics.VAMax
        ? convertNumberToBaseAndPow10Exponent(metrics.VAMax)
        : null;
    const setMaxW = convertNumberToBaseAndPow10Exponent(metrics.WMax);
    const setMaxVar = metrics.VArMaxQ1
        ? convertNumberToBaseAndPow10Exponent(metrics.VArMaxQ1)
        : null;

    return {
        updatedTime: new Date(),
        // hard-coded modes
        modesEnabled: derControlTypeModes,
        // SunSpec inverters don't properly support WGra
        // so we use a software based implementation of ramp rates
        setGradW: rampRateHelper.getDerSettingsSetGradW(),
        setMaxVA: setMaxVA
            ? {
                  value: setMaxVA.base,
                  multiplier: setMaxVA.pow10,
              }
            : undefined,
        setMaxW: {
            value: setMaxW.base,
            multiplier: setMaxW.pow10,
        },
        setMaxVar: setMaxVar
            ? {
                  value: setMaxVar.base,
                  multiplier: setMaxVar.pow10,
              }
            : undefined,
    };
}

export function getDerStatusResponseFromSunSpecArray(
    statusModels: StatusModel[],
): DERStatus {
    const metrics = getAggregatedStatusMetrics(statusModels);
    const now = new Date();
    const operationalModeStatus: OperationalModeStatus = enumHasValue(
        metrics.PVConn,
        PVConn.CONNECTED,
    )
        ? OperationalModeStatus.OperationalMode
        : OperationalModeStatus.Off;
    const genConnectStatus: ConnectStatus = getConnectStatusFromPVConn(
        metrics.PVConn,
    );

    return {
        readingTime: now,
        operationalModeStatus: {
            dateTime: now,
            value: operationalModeStatus,
        },
        genConnectStatus: {
            dateTime: now,
            value: genConnectStatus,
        },
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
