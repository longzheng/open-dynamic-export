import type { LookupAddress, LookupOptions } from 'node:dns';
import type { LookupFunction } from 'node:net';
import { describe, it, expect } from 'vitest';
import { createLookupWithIpv4Fallback } from './dnsLookup.js';

type Result = {
    error: NodeJS.ErrnoException | null;
    address: string | LookupAddress[];
    family?: number;
};

function errnoError(code: string): NodeJS.ErrnoException {
    return Object.assign(new Error(`getaddrinfo ${code} example.com`), {
        code,
    });
}

// A fake resolver that fails dual-stack lookups with `failCode` and answers
// IPv4-only lookups, recording every call it receives.
function fakeLookup(failCode: string | null) {
    const calls: LookupOptions[] = [];
    const lookup: LookupFunction = (_hostname, options, callback) => {
        calls.push(options);
        if (failCode && options.family !== 4) {
            callback(errnoError(failCode), '', 0);
            return;
        }
        if (options.all) {
            callback(null, [{ address: '192.0.2.1', family: 4 }]);
            return;
        }
        callback(null, '192.0.2.1', 4);
    };
    return { lookup, calls };
}

function run(lookup: LookupFunction, options: LookupOptions) {
    return new Promise<Result>((resolve) => {
        lookup('example.com', options, (error, address, family) => {
            resolve({ error, address, family });
        });
    });
}

describe('createLookupWithIpv4Fallback', () => {
    it('passes a successful lookup through without retrying', async () => {
        const base = fakeLookup(null);

        const result = await run(createLookupWithIpv4Fallback(base.lookup), {});

        expect(result).toEqual({
            error: null,
            address: '192.0.2.1',
            family: 4,
        });
        expect(base.calls).toEqual([{}]);
    });

    it('retries IPv4-only when a dual-stack lookup fails with EAI_AGAIN', async () => {
        const base = fakeLookup('EAI_AGAIN');

        const result = await run(createLookupWithIpv4Fallback(base.lookup), {
            hints: 0,
        });

        expect(result).toEqual({
            error: null,
            address: '192.0.2.1',
            family: 4,
        });
        expect(base.calls).toEqual([{ hints: 0 }, { hints: 0, family: 4 }]);
    });

    it('keeps the all option on the retry', async () => {
        const base = fakeLookup('EAI_AGAIN');

        const result = await run(createLookupWithIpv4Fallback(base.lookup), {
            all: true,
        });

        expect(result.error).toBeNull();
        expect(result.address).toEqual([{ address: '192.0.2.1', family: 4 }]);
        expect(base.calls).toEqual([{ all: true }, { all: true, family: 4 }]);
    });

    it('does not retry when the caller already chose a family', async () => {
        const base = fakeLookup('EAI_AGAIN');

        const result = await run(createLookupWithIpv4Fallback(base.lookup), {
            family: 6,
        });

        expect(result.error?.code).toBe('EAI_AGAIN');
        expect(base.calls).toEqual([{ family: 6 }]);
    });

    it('does not retry other errors', async () => {
        const base = fakeLookup('ENOTFOUND');

        const result = await run(createLookupWithIpv4Fallback(base.lookup), {});

        expect(result.error?.code).toBe('ENOTFOUND');
        expect(base.calls).toEqual([{}]);
    });
});
