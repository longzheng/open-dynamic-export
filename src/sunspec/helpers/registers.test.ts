import { expect, it } from 'vitest';
import { registersToString, registersToUint32 } from './registers';

it('registersToUint32 should convert registers to a 32-bit unsigned integer', () => {
    const registers = [0x1234, 0x5678];
    const result = registersToUint32(registers);
    expect(result).toBe(0x12345678);
});

it('registersToString should convert registers to a string', () => {
    const registers = [0x4672, 0x6f6e, 0x6975, 0x7300];
    const result = registersToString(registers);
    expect(result).toBe('Fronius');
});
