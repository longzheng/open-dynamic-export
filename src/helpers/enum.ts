import { safeParseHexString } from './number';

type EnumType = { [key: string]: number | string };

export function stringHexToEnumType<T>(value: string): T {
    return safeParseHexString(value) as T;
}

export function safeParseStringToEnumType<T extends EnumType>(
    value: string,
    enumObject: T,
) {
    const enumName = (Object.keys(enumObject) as Array<keyof T>).find(
        (k) => enumObject[k] === value,
    );

    if (!enumName) {
        throw Error('value is not in enum');
    }

    return enumObject[enumName];
}

export function enumHasValue<T extends number>(
    enumValue: T,
    value: T,
): boolean {
    return (enumValue & value) !== 0;
}
