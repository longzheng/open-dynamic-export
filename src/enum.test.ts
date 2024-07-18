import { it, expect } from 'vitest';
import { mapEnumValueToEnumFlagsObject } from './enum';

enum TestBitwise {
    hello = 1 << 0,
    world = 1 << 1,
    there = 1 << 2,
}

export type TestBitwiseObject = Record<keyof typeof TestBitwise, boolean>;

export function mapEnumValueToTestBitwiseObject(
    value: number,
): TestBitwiseObject {
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
