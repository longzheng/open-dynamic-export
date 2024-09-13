import {
    registersToId,
    registersToString,
    registersToStringNullable,
    registersToUint16,
    registersToUint16Nullable,
} from '../helpers/converters.js';
import { sunSpecModelFactory } from './sunSpecModelFactory.js';

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

export const commonModel = sunSpecModelFactory<CommonModel>({
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
            end: 18,
            readConverter: registersToString,
        },
        Md: {
            start: 18,
            end: 34,
            readConverter: registersToString,
        },
        Opt: {
            start: 34,
            end: 42,
            readConverter: registersToStringNullable,
        },
        Vr: {
            start: 42,
            end: 50,
            readConverter: registersToStringNullable,
        },
        SN: {
            start: 50,
            end: 66,
            readConverter: registersToString,
        },
        DA: {
            start: 66,
            end: 67,
            readConverter: registersToUint16Nullable,
        },
    },
});
