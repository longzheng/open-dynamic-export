import { modbusModelFactory } from '../../../modbus/modbusModelFactory.js';
import {
    registersToString,
    registersToUint16,
} from '../../../modbus/helpers/converters.js';

export type GoodweEtDeviceParameters = {
    // Inverter rated power
    RatePower: number;
    // Inverter serial number. ASCII,16 bytes,readtogether, include OEMproducts.
    INVSN: string;
    // ASCII，10 bytes
    Modelname: string;
};

export const GoodweEtDeviceParametersModel =
    modbusModelFactory<GoodweEtDeviceParameters>({
        name: 'GoodweEtDeviceParametersModel',
        mapping: {
            RatePower: {
                start: 0,
                end: 1,
                readConverter: registersToUint16,
            },
            INVSN: {
                start: 2,
                end: 11,
                readConverter: registersToString,
            },
            Modelname: {
                start: 12,
                end: 22,
                readConverter: registersToString,
            },
        },
    });
