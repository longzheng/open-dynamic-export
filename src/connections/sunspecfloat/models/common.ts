import {
    registersToId,
    registersToString,
    registersToStringNullable,
    registersToUint16,
    registersToUint16Nullable,
} from '../../modbus/helpers/converters.js';
import { modbusModelFactory } from '../../modbus/modbusModelFactory.js';

// generated from SunSpec_Information_Model_Reference_20240701.xlsx

/**
 * Common
 *
 * All SunSpec compliant devices must include this as the first model
 */
export type CommonModel = {
    /**
     * Model ID
     *
     * Model identifier
     */
    ID: 1;

    /**
     * Model Length
     *
     * Model length
     */
    L: number;

    /**
     * Manufacturer
     *
     * Well known value registered with SunSpec for compliance
     */
    Mn: string;

    /**
     * Model
     *
     * Manufacturer specific value (32 chars)
     */
    Md: string;

    /**
     * Options
     *
     * Manufacturer specific value (16 chars)
     */
    Opt: string | null;

    /**
     * Version
     *
     * Manufacturer specific value (16 chars)
     */
    Vr: string | null;

    /**
     * Serial Number
     *
     * Manufacturer specific value (32 chars)
     */
    SN: string;

    /**
     * Device Address
     *
     * Modbus device address
     *
     * This point is mandatory for all SunSpec RTU devices and, for those devices, they must support values from 1-247.
     */
    DA: number | null;
};

export const commonModel = modbusModelFactory<CommonModel>({
    name: 'common',
    mapping: {
        ID: {
            start: 0,
            end: 1,
            readConverter: (value) => registersToId(value, 1),
        },
        L: {
            start: 1,
            end: 2,
            readConverter: registersToUint16,
        },
        Mn: {
            start: 2,
            end: 20,
            readConverter: registersToString,
        },
        Md: {
            start: 20,
            end: 36,
            readConverter: registersToString,
        },
        Opt: {
            start: 36,
            end: 44,
            readConverter: registersToStringNullable,
        },
        Vr: {
            start: 44,
            end: 52,
            readConverter: registersToStringNullable,
        },
        SN: {
            start: 52,
            end: 68,
            readConverter: registersToString,
        },
        DA: {
            start: 68,
            end: 69,
            readConverter: registersToUint16Nullable,
        },
    },
});
