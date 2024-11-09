import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ModbusConnection } from './base.js';
import { type ModbusSchema } from '../../helpers/config.js';

vi.mock('modbus-serial');

describe('ModbusConnection', () => {
    let config: ModbusSchema['connection'];
    let modbusConnection: ModbusConnection;

    beforeEach(() => {
        config = {
            type: 'tcp',
            ip: '127.0.0.1',
            port: 502,
        };
        modbusConnection = new ModbusConnection(config);
    });

    it('should connect to the Modbus server', async () => {
        await modbusConnection.connect();
        expect(modbusConnection['state'].type).toBe('connected');
    });

    it('should read holding registers', async () => {
        const readHoldingRegistersMock = vi
            .spyOn(modbusConnection['client'], 'readHoldingRegisters')
            .mockResolvedValue({
                data: [1, 2, 3],
                buffer: Buffer.from([]), // buffer value is not used
            });

        const result = await modbusConnection.readRegisters({
            type: 'holding',
            unitId: 1,
            start: 0,
            length: 3,
        });

        expect(readHoldingRegistersMock).toHaveBeenCalledWith(0, 3);
        expect(result.data).toEqual([1, 2, 3]);
    });

    it('should write holding registers', async () => {
        const writeRegistersMock = vi
            .spyOn(modbusConnection['client'], 'writeRegisters')
            .mockResolvedValue({
                address: 0,
                length: 3,
            });

        await modbusConnection.writeRegisters({
            type: 'holding',
            unitId: 1,
            start: 0,
            data: [1, 2, 3],
        });

        expect(writeRegistersMock).toHaveBeenCalledWith(0, [1, 2, 3]);
    });

    it('should handle mutex in readRegisters', async () => {
        const timestamps: number[] = [];

        const readHoldingRegistersMock = vi
            .spyOn(modbusConnection['client'], 'readHoldingRegisters')
            // eslint-disable-next-line @typescript-eslint/require-await
            .mockImplementation(async () => {
                timestamps.push(performance.now());
                return {
                    data: [1, 2, 3],
                    buffer: Buffer.from([]),
                };
            });

        const readPromise1 = modbusConnection.readRegisters({
            type: 'holding',
            unitId: 1,
            start: 0,
            length: 3,
        });

        const readPromise2 = modbusConnection.readRegisters({
            type: 'holding',
            unitId: 1,
            start: 0,
            length: 3,
        });

        const [result1, result2] = await Promise.all([
            readPromise1,
            readPromise2,
        ]);

        expect(readHoldingRegistersMock).toHaveBeenCalledTimes(2);
        expect(timestamps[0]).not.toEqual(timestamps[1]);
        expect(result1.data).toEqual([1, 2, 3]);
        expect(result2.data).toEqual([1, 2, 3]);
    });

    it('should handle mutex in writeRegisters', async () => {
        const timestamps: number[] = [];

        const writeRegistersMock = vi
            .spyOn(modbusConnection['client'], 'writeRegisters')
            // eslint-disable-next-line @typescript-eslint/require-await
            .mockImplementation(async () => {
                timestamps.push(performance.now());
                return {
                    address: 0,
                    length: 3,
                };
            });

        const writePromise1 = modbusConnection.writeRegisters({
            type: 'holding',
            unitId: 1,
            start: 0,
            data: [1, 2, 3],
        });

        const writePromise2 = modbusConnection.writeRegisters({
            type: 'holding',
            unitId: 1,
            start: 0,
            data: [4, 5, 6],
        });

        await Promise.all([writePromise1, writePromise2]);

        expect(writeRegistersMock).toHaveBeenCalledTimes(2);
        expect(timestamps[0]).not.toEqual(timestamps[1]);
        expect(writeRegistersMock).toHaveBeenCalledWith(0, [1, 2, 3]);
        expect(writeRegistersMock).toHaveBeenCalledWith(0, [4, 5, 6]);
    });
});
