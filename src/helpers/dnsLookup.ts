import * as dns from 'node:dns';
import type { LookupFunction } from 'node:net';

// A dual-stack lookup that retries as IPv4-only when it fails with EAI_AGAIN.
//
// Some DNS zones answer A queries but fail AAAA ones. Energy Queensland's
// sep2.pwip.energyq.com.au (the CNAME target of sep2.energyq.com.au) refers
// AAAA queries back to its own nameservers, so most recursive resolvers return
// SERVFAIL. glibc's getaddrinfo still returns the A record, but musl's (used by
// the node:alpine Docker image) fails the whole lookup with EAI_AGAIN, so every
// request fails even though the host has a working IPv4 address.
export function createLookupWithIpv4Fallback(
    baseLookup: LookupFunction,
): LookupFunction {
    return (hostname, options, callback) => {
        baseLookup(hostname, options, (error, address, family) => {
            if (error?.code === 'EAI_AGAIN' && !options.family) {
                baseLookup(hostname, { ...options, family: 4 }, callback);
                return;
            }

            callback(error, address, family);
        });
    };
}

export const lookupWithIpv4Fallback: LookupFunction =
    createLookupWithIpv4Fallback((hostname, options, callback) =>
        dns.lookup(hostname, options, callback),
    );
