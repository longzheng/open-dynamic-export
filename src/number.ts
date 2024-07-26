import Decimal from 'decimal.js';

export function safeParseIntString(value: string): number {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
        throw new Error(`Value "${value}" is not a valid number`);
    }
    return parsed;
}

export function safeParseHexString(value: string): number {
    const parsed = parseInt(value, 16);
    if (isNaN(parsed)) {
        throw new Error(`Value "${value}" is not a valid hex`);
    }
    return parsed;
}

export function numberToHex(value: number): string {
    return value.toString(16).toUpperCase();
}

export function numberWithPow10(number: number, pow10: number): number {
    return new Decimal(number).mul(new Decimal(10).pow(pow10)).toNumber();
}

export function numberNullableWithPow10(number: number | null, pow10: number) {
    if (number === null) {
        return null;
    }

    return numberWithPow10(number, pow10);
}

export function sumNumbersArray(numbers: number[]) {
    return numbers
        .reduce((acc, number) => acc.plus(new Decimal(number)), new Decimal(0))
        .toNumber();
}

export function sumNumbersNullableArray(numbers: (number | null)[]) {
    if (numbers.some((number) => number === null)) {
        return null;
    }

    return sumNumbersArray(numbers as number[]);
}

export function averageNumbersArray(numbers: number[]) {
    return new Decimal(sumNumbersArray(numbers)).div(numbers.length).toNumber();
}

export function averageNumbersNullableArray(numbers: (number | null)[]) {
    if (numbers.some((number) => number === null)) {
        return null;
    }

    return averageNumbersArray(numbers as number[]);
}
