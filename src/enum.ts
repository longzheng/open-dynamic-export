import { safeParseHexString } from './number';

type EnumType = { [key: string]: number | string };

export function stringHexToEnumType<T>(value: string): T {
    return safeParseHexString(value) as T;
}

export function mapEnumValueToEnumFlagsObject<T extends EnumType>(
    value: number,
    enumObj: T,
): Record<keyof T, boolean> {
    return Object.keys(enumObj)
        .filter((key) => isNaN(Number(key)))
        .reduce(
            (flags, flag) => {
                flags[flag as keyof T] =
                    (value & Number(enumObj[flag as keyof T])) !== 0;
                return flags;
            },
            {} as Record<keyof T, boolean>,
        );
}
