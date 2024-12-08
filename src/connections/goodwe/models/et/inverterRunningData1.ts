import { modbusModelFactory } from '../../../modbus/modbusModelFactory.js';
import {
    registersToInt32,
    registersToUint16,
} from '../../../modbus/helpers/converters.js';

export type GoodweEtInverterRunningData1 = {
    // R phase Grid voltage
    Vgrid_R: number;
    // R phase Grid current
    Igrid_R: number;
    // R phase Grid Frequency
    Fgrid_R: number;
    // R phase Grid Power(Inv power)
    Pgrid_R: number;
    // S phase Grid voltage
    Vgrid_S: number;
    // S phase Grid current
    Igrid_S: number;
    // S phase Grid Frequency
    Fgrid_S: number;
    // S phase Grid Power(Inv power)
    Pgrid_S: number;
    // T phase Grid voltage
    Vgrid_T: number;
    // T phase Grid current
    Igrid_T: number;
    // T phase Grid Frequency
    Fgrid_T: number;
    // T phase Grid Power(Inv power)
    Pgrid_T: number;
    // Grid connection status
    GridMode: GridMode;
    // Total Power of Inverter(Inv power)
    TotalINVPower: number;
    // Total Active Power Of Inverter. (If meter connection ok, it is meter power.If meter connection fail, it is inverter on-grid port power)
    ACActivePower: number;
    // Total Reactive Power Of Inverter
    ACReactivePower: number;
    // Total Apparent Power Of Inverter
    ACApparentPower: number;
};

export enum GridMode {
    // 0x00 Loss, inverter disconnects to Grid
    Loss = 0,
    // 0x01 OK, inverter connects to Grid
    OK = 1,
    // 0x02 Fault, something is wrong
    Fault = 2,
}

export const GoodweEtInverterRunningData1Model =
    modbusModelFactory<GoodweEtInverterRunningData1>({
        name: 'GoodweEtInverterRunningData1Model',
        mapping: {
            Vgrid_R: {
                start: 0,
                end: 1,
                readConverter: (value) => registersToUint16(value, -1),
            },
            Igrid_R: {
                start: 1,
                end: 2,
                readConverter: (value) => registersToUint16(value, -1),
            },
            Fgrid_R: {
                start: 2,
                end: 3,
                readConverter: (value) => registersToUint16(value, -2),
            },
            Pgrid_R: {
                start: 3,
                end: 5,
                readConverter: registersToInt32,
            },
            Vgrid_S: {
                start: 5,
                end: 6,
                readConverter: (value) => registersToUint16(value, -1),
            },
            Igrid_S: {
                start: 6,
                end: 7,
                readConverter: (value) => registersToUint16(value, -1),
            },
            Fgrid_S: {
                start: 7,
                end: 8,
                readConverter: (value) => registersToUint16(value, -2),
            },
            Pgrid_S: {
                start: 8,
                end: 10,
                readConverter: registersToInt32,
            },
            Vgrid_T: {
                start: 10,
                end: 11,
                readConverter: (value) => registersToUint16(value, -1),
            },
            Igrid_T: {
                start: 11,
                end: 12,
                readConverter: (value) => registersToUint16(value, -1),
            },
            Fgrid_T: {
                start: 12,
                end: 13,
                readConverter: (value) => registersToUint16(value, -2),
            },
            Pgrid_T: {
                start: 13,
                end: 15,
                readConverter: registersToInt32,
            },
            GridMode: {
                start: 15,
                end: 16,
                readConverter: registersToUint16,
            },
            TotalINVPower: {
                start: 16,
                end: 18,
                readConverter: registersToInt32,
            },
            ACActivePower: {
                start: 18,
                end: 20,
                readConverter: registersToInt32,
            },
            ACReactivePower: {
                start: 20,
                end: 22,
                readConverter: registersToInt32,
            },
            ACApparentPower: {
                start: 22,
                end: 24,
                readConverter: registersToInt32,
            },
        },
    });
