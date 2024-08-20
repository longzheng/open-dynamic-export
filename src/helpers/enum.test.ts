import { it, expect, describe } from 'vitest';
import { enumHasValue, mapEnumValueToEnumFlagsObject } from './enum';

enum TestBitwise {
    hello = 1 << 0,
    world = 1 << 1,
    there = 1 << 2,
}

export type TestBitwiseObject = Record<keyof typeof TestBitwise, boolean>;

describe('mapEnumValueToTestBitwiseObject', () => {
    function mapEnumValueToTestBitwiseObject(value: number): TestBitwiseObject {
        return mapEnumValueToEnumFlagsObject(value, TestBitwise);
    }

    it('map to object', () => {
        const value = TestBitwise.hello | TestBitwise.world;

        const object = mapEnumValueToTestBitwiseObject(value);

        expect(object).toStrictEqual({
            hello: true,
            world: true,
            there: false,
        } satisfies TestBitwiseObject);
    });
});

describe('enumHasValue', () => {
    it('should return true if value is in enum', () => {
        const result = enumHasValue(
            TestBitwise.hello | TestBitwise.world,
            TestBitwise.hello,
        );

        expect(result).toBe(true);
    });

    it('should return false if value is not in enum', () => {
        const result = enumHasValue(TestBitwise.hello, TestBitwise.world);

        expect(result).toBe(false);
    });
});
