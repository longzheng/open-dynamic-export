import { Decimal } from 'decimal.js';

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

export function sumNumbersNullableArray(
    numbers: (number | null)[],
): number | null {
    const nonNullableNumbers = numbers.filter((number) => number !== null);

    if (nonNullableNumbers.length === 0) {
        return null;
    }

    return sumNumbersArray(nonNullableNumbers);
}

export function averageNumbersArray(numbers: number[]) {
    if (numbers.length === 0) {
        return 0;
    }

    return new Decimal(sumNumbersArray(numbers)).div(numbers.length).toNumber();
}

export function averageNumbersNullableArray(
    numbers: (number | null)[],
): number | null {
    const nonNullableNumbers = numbers.filter((number) => number !== null);

    if (nonNullableNumbers.length === 0) {
        return null;
    }

    return averageNumbersArray(nonNullableNumbers);
}

export function mathMinNullableArray(
    numbers: (number | null)[],
): number | null {
    const nonNullableNumbers = numbers.filter((number) => number !== null);

    if (nonNullableNumbers.length === 0) {
        return null;
    }

    return Math.min(...nonNullableNumbers);
}

export function mathMaxNullableArray(
    numbers: (number | null)[],
): number | null {
    const nonNullableNumbers = numbers.filter((number) => number !== null);

    if (nonNullableNumbers.length === 0) {
        return null;
    }

    return Math.max(...nonNullableNumbers);
}

export function convertNumberToBaseAndPow10Exponent(number: number): {
    base: number;
    pow10: number;
} {
    if (Number.isNaN(number) || !Number.isFinite(number)) {
        return { base: 0, pow10: 0 };
    }

    let decimal = new Decimal(number);

    // Special case for 0
    if (decimal.equals(0)) {
        return { base: 0, pow10: 0 };
    }

    let pow10 = 0;

    // Handle decimals by multiplying until the number becomes an integer
    while (!decimal.isInteger()) {
        decimal = decimal.mul(10);
        pow10 -= 1;
    }

    // Handle trailing zeros
    while (decimal.mod(10).equals(0)) {
        decimal = decimal.div(10);
        pow10 += 1;
    }

    return { base: decimal.toNumber(), pow10 };
}

export function sumBigIntArray(numbers: bigint[]) {
    return numbers.reduce((acc, number) => number + acc, BigInt(0));
}

export function randomNumber(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

export function roundToDecimals(value: number, decimals: number) {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
