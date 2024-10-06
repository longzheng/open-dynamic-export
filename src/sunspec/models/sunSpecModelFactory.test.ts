import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    convertReadRegisters,
    convertWriteRegisters,
    sunSpecModelFactory,
    type Mapping,
} from './sunSpecModelFactory.js';
import {
    int16ToRegisters,
    registersToInt16,
    registersToString,
    registersToUint16,
    uint16ToRegisters,
} from '../helpers/converters.js';
import { InverterSunSpecConnection } from '../connection/inverter.js';
import { SunSpecConnection } from '../connection/base.js';

vi.mock(import('modbus-serial'));

type Model = {
    ID: number;
    Hello: number;
    World: number;
    Test: string;
};

type ModelWrite = Pick<Model, 'Hello' | 'World'>;

const mapping: Mapping<Model, keyof ModelWrite> = {
    ID: {
        start: 0,
        end: 1,
        readConverter: registersToUint16,
    },
    Hello: {
        start: 1,
        end: 2,
        readConverter: registersToUint16,
        writeConverter: uint16ToRegisters,
    },
    World: {
        start: 2,
        end: 3,
        readConverter: registersToInt16,
        writeConverter: int16ToRegisters,
    },
    Test: {
        start: 3,
        end: 6,
        readConverter: registersToString,
    },
};

it('convertReadRegisters should convert registers to model', () => {
    const registers: number[] = [
        0x0001, 0x0011, 0x0111, 0x6865, 0x6c6c, 0x6f00,
    ];

    const result = convertReadRegisters({
        registers,
        mapping,
    });

    expect(result).toStrictEqual({
        ID: 1,
        Hello: 17,
        World: 273,
        Test: 'hello',
    });
});

it('convertWriteRegisters should convert registers to model', () => {
    const values = {
        Hello: 3,
        World: -128,
    } satisfies ModelWrite;

    const result = convertWriteRegisters({
        values,
        mapping,
        length: 6,
    });

    expect(result).toEqual([0, 3, 0xff80, 0, 0, 0]);
});

describe('sunSpecModelFactory', () => {
    let inverterSunSpecConnection: InverterSunSpecConnection;

    const model = sunSpecModelFactory<Model, keyof ModelWrite>({
        name: 'test',
        mapping,
    });

    beforeEach(() => {
        inverterSunSpecConnection = new InverterSunSpecConnection({
            ip: '127.0.0.1',
            port: 502,
            unitId: 1,
        });

        // intercept SunSpecConnection scanModelAddresses to prevent actual scanning
        vi.spyOn(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            SunSpecConnection.prototype as any,
            'scanModelAddresses',
        ).mockResolvedValue(new Map());
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('sunSpecModelFactory.read returns correct data', async () => {
        const readHoldingRegistersMock = vi
            .spyOn(inverterSunSpecConnection.client, 'readHoldingRegisters')
            .mockResolvedValue({
                data: [0x0001, 0x0011, 0x0111, 0x6865, 0x6c6c, 0x6f00],
                buffer: Buffer.from([]), // buffer value is not used
            });

        const result = await model.read({
            modbusConnection: inverterSunSpecConnection,
            address: { start: 40000, length: 6 },
        });

        expect(result).toEqual({
            ID: 1,
            Hello: 17,
            World: 273,
            Test: 'hello',
        });

        expect(readHoldingRegistersMock).toHaveBeenCalledOnce();
        expect(readHoldingRegistersMock).toHaveBeenCalledWith(40000, 6);
    });

    it('sunSpecModelFactory.write returns if data updated', async () => {
        const writeRegistersMock = vi
            .spyOn(inverterSunSpecConnection.client, 'writeRegisters')
            .mockResolvedValue({ address: 40000, length: 6 });

        const values = {
            Hello: 3,
            World: -128,
        } satisfies ModelWrite;

        await expect(
            model.write({
                values,
                modbusConnection: inverterSunSpecConnection,
                address: { start: 40000, length: 6 },
            }),
        ).resolves.toBeUndefined();

        expect(writeRegistersMock).toHaveBeenCalledOnce();
        expect(writeRegistersMock).toHaveBeenCalledWith(
            40000,
            [0, 3, 0xff80, 0, 0, 0],
        );
    });
});
