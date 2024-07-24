import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    convertReadRegisters,
    convertWriteRegisters,
    sunSpecModelFactory,
    type Mapping,
} from './sunSpecModelFactory';
import {
    int16ToRegisters,
    registersToInt16,
    registersToString,
    registersToUint16,
    uint16ToRegisters,
} from '../helpers/converters';
import { InverterSunSpecConnection } from '../connection/inverter';

vi.mock('modbus-serial', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        // mocking the ModbusRTU class default export
        default: vi.fn().mockReturnValue({
            // not sure if there's another way to implement the actual ModbusRTU class
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
            on: (actual as any).prototype.on,
            // we just need to override isOpen to prevent the connection from taking place
            isOpen: true,
        }),
    };
});

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

const model = sunSpecModelFactory<Model, keyof ModelWrite>({
    mapping,
});

describe('sunSpecModelFactory', () => {
    let inverterSunSpecConnection: InverterSunSpecConnection;

    beforeEach(() => {
        inverterSunSpecConnection = new InverterSunSpecConnection({
            ip: '127.0.0.1',
            port: 502,
            unitId: 1,
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

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

    it('sunSpecModelFactory.read returns correct data', async () => {
        const readHoldingRegistersMock = vi.fn().mockResolvedValue({
            data: [0x0001, 0x0011, 0x0111, 0x6865, 0x6c6c, 0x6f00],
        });
        inverterSunSpecConnection.client.readHoldingRegisters =
            readHoldingRegistersMock;

        const result = await model.read({
            modbusConnection: inverterSunSpecConnection,
            addressStart: 40000,
        });

        expect(result).toEqual({
            ID: 1,
            Hello: 17,
            World: 273,
            Test: 'hello',
        });
    });

    it('sunSpecModelFactory.write returns true if data updated', async () => {
        const readHoldingRegistersMock = vi.fn().mockResolvedValue({
            data: [0x0001, 0x0003, 0xff80, 0x6865, 0x6c6c, 0x6f00],
        });
        inverterSunSpecConnection.client.readHoldingRegisters =
            readHoldingRegistersMock;

        const writeRegistersMock = vi.fn();
        inverterSunSpecConnection.client.writeRegisters = writeRegistersMock;

        const values = {
            Hello: 3,
            World: -128,
        } satisfies ModelWrite;

        await model.write({
            values,
            modbusConnection: inverterSunSpecConnection,
            addressStart: 40000,
        });

        expect(writeRegistersMock).toHaveBeenCalledOnce();
        expect(writeRegistersMock).toHaveBeenCalledWith(
            40000,
            [0, 3, 0xff80, 0, 0, 0],
        );
    });
});
