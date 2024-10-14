import { safeParseHexString } from './number.js';

export function stringHexToEnumType<T>(value: string): T {
    return safeParseHexString(value) as T;
}

export function enumHasValue<T extends number>(
    enumValue: T,
    value: T,
): boolean {
    return (enumValue & value) !== 0;
}
