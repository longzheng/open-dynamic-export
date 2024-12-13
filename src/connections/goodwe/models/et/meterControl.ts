import { modbusModelFactory } from '../../../modbus/modbusModelFactory.js';
import {
    int16ToRegisters,
    registersToInt16,
    registersToUint16,
    uint16ToRegisters,
} from '../../../modbus/helpers/converters.js';

export type GoodweEtMeterControl = {
    // Use FeedPowerEnable (47509) to activate export power limit function.
    // [0, 1: Enable]
    FeedPowerEnable: boolean;
    // and EMSPowerSet (47510) to set the max allowed export power to grid
    // [0,10000]
    FeedPowerPara: number;
};

export type GoodweEtMeterControlWrite = Pick<
    GoodweEtMeterControl,
    'FeedPowerEnable' | 'FeedPowerPara'
>;

export const GoodweGoodweEtMeterControlModel = modbusModelFactory<
    GoodweEtMeterControl,
    keyof GoodweEtMeterControlWrite
>({
    name: 'GoodweGoodweEtMeterControlModel',
    mapping: {
        FeedPowerEnable: {
            start: 0,
            end: 1,
            readConverter: (value) => registersToUint16(value) === 1,
            writeConverter: (value) => uint16ToRegisters(value ? 1 : 0),
        },
        FeedPowerPara: {
            start: 1,
            end: 2,
            readConverter: registersToInt16,
            writeConverter: int16ToRegisters,
        },
    },
});
