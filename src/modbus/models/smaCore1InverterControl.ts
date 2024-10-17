import { modbusModelFactory } from '../modbusModelFactory.js';
import {
    int16ToRegisters,
    registersToInt16,
    registersToUint32,
    uint32ToRegisters,
} from '../../sunspec/helpers/converters.js';

export type SmaCore1InverterControlModels = SmaCore1InverterControl1 &
    SmaCore1InverterControl2;

export type SmaCore1InverterControl1 = {
    // Operating mode active power setting
    // 303: Off (Off)
    // 1077: Manual setting in W (WCnst)
    // 1078: Manual setting in % (WCnstNom)
    // 1079: External setting (WCtlCom)
    WModCfg_WMod: SmaCore1InverterControlWModCfgWMod;
};

export enum SmaCore1InverterControlWModCfgWMod {
    Off = 303,
    ManualSettingInW = 1077,
    ManualSettingInPercent = 1078,
    ExternalSetting = 1079,
}

export type SmaCore1InverterControl2 = {
    // Fast shut-down
    // 381: Stop (Stop)
    // 1467: Start (Str)
    FstStop: SmaCore1InverterControlFstStop;
    // Normalized active power limitation by PV system control
    WModCfg_WCtlComCfg_WNomPrc: number;
};

export enum SmaCore1InverterControlFstStop {
    Stop = 381,
    Start = 1467,
}

export const SmaCore1InverterControl1Model = modbusModelFactory<
    SmaCore1InverterControl1,
    keyof SmaCore1InverterControl1
>({
    name: 'SmaCore1InverterControl1Model',
    mapping: {
        WModCfg_WMod: {
            start: 0,
            end: 2,
            readConverter: registersToUint32,
            writeConverter: uint32ToRegisters,
        },
    },
});

export const SmaCore1InverterControl2Model = modbusModelFactory<
    SmaCore1InverterControl2,
    keyof SmaCore1InverterControl2
>({
    name: 'SmaCore1InverterControl2Model',
    mapping: {
        FstStop: {
            start: 0,
            end: 2,
            readConverter: registersToUint32,
            writeConverter: uint32ToRegisters,
        },
        WModCfg_WCtlComCfg_WNomPrc: {
            start: 2,
            end: 3,
            readConverter: (value) => registersToInt16(value, -2),
            writeConverter: (value) => int16ToRegisters(value, 2),
        },
    },
});
