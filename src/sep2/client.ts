import { createHash } from 'node:crypto';
import { Agent } from 'undici';
import { parseStringPromise } from 'xml2js';
import { numberToHex } from '../helpers/number.js';
import {
    buildUrl,
    fetchWithError,
    type FetchClientResponse,
    type FetchRequestConfig,
} from '../helpers/fetch.js';
import {
    getCertificateFingerprint,
    getCertificateLfdi,
    getCertificateSfdi,
} from './helpers/cert.js';
import type { RoleFlagsType } from './models/roleFlagsType.js';

const USER_AGENT = 'open-dynamic-export';

export type SEP2RequestConfig<TBody = unknown> = FetchRequestConfig<TBody>;
export type SEP2Response<TData = unknown> = FetchClientResponse<TData>;

export class SEP2Client {
    private readonly host: string;
    public readonly pen: string;
    public readonly lfdi: string;
    public readonly sfdi: string;
    private readonly dispatcher: Agent;

    constructor({
        host,
        cert,
        key,
        pen,
    }: {
        host: string;
        cert: string;
        key: string;
        pen: string;
    }) {
        this.host = host;
        this.pen = pen.padStart(8, '0');

        const certificateFingerprint = getCertificateFingerprint(cert);

        this.lfdi = getCertificateLfdi(certificateFingerprint);
        this.sfdi = getCertificateSfdi(certificateFingerprint);

        this.dispatcher = new Agent({
            connect: {
                cert,
                key,
                // the device certificate will have the full chain
                ca: cert,
                // ignore certificate errors
                rejectUnauthorized: false,
                // the IEEE2023.5 certificate does not have the host name as the certificate altnames
                // bypass the server identity check
                checkServerIdentity: () => undefined,
            },
        });
    }

    private getDefaultConfig<TBody>(): SEP2RequestConfig<TBody> {
        return {
            dispatcher: this.dispatcher,
            headers: {
                'User-Agent': USER_AGENT,
                Accept: 'application/sep+xml',
                'Content-Type': 'application/sep+xml',
            },
        };
    }

    async get(
        link: string,
        options?: SEP2RequestConfig<never>,
    ): Promise<unknown> {
        const url = buildUrl(this.host, link);
        const response = await fetchWithError<string, never>(url, {
            ...this.getDefaultConfig(),
            ...options,
            headers: {
                ...this.getDefaultConfig().headers,
                ...options?.headers,
            },
            method: 'GET',
            // exponential backoff retry
            retry: options?.retry ?? { retries: 5 },
        });

        return await parseStringPromise(response.data);
    }

    async post<T>(
        link: string,
        data: T,
        options?: SEP2RequestConfig<T>,
    ): Promise<SEP2Response> {
        const url = buildUrl(this.host, link);
        return await fetchWithError(url, {
            ...this.getDefaultConfig<T>(),
            ...options,
            headers: {
                ...this.getDefaultConfig().headers,
                ...options?.headers,
            },
            method: 'POST',
            body: data,
        });
    }

    async put<T>(
        link: string,
        data: T,
        options?: SEP2RequestConfig<T>,
    ): Promise<SEP2Response> {
        const url = buildUrl(this.host, link);
        return await fetchWithError(url, {
            ...this.getDefaultConfig<T>(),
            ...options,
            headers: {
                ...this.getDefaultConfig().headers,
                ...options?.headers,
            },
            method: 'PUT',
            body: data,
        });
    }

    // From the SEP2 Client Handbook
    // A suggested naming pattern for the Usage Point mRID(s) could include a truncated LFDI with the role flags, in addition to a PEN
    generateUsagePointMrid(lfdi: string, roleFlags: RoleFlagsType) {
        return `${lfdi.substring(0, 22)}${numberToHex(roleFlags).padStart(2, '0')}${this.pen}`;
    }

    // From the SEP2 Client Handbook
    // The mRID of each MeterReading needs to be unique for that EndDevice
    // hash the description to generate a consistent mRID for the "type" of MeterReadingMrid
    generateMeterReadingMrid({
        description,
        roleFlags,
    }: {
        description: string;
        roleFlags: RoleFlagsType;
    }) {
        return `${createHash('sha256').update(description).digest('hex').substring(0, 22).toUpperCase()}${numberToHex(roleFlags).padStart(2, '0')}${this.pen}`;
    }
}

// default polling and post rates for resources
// extracted from page 16 of SEP2 Client Handbook
export const defaultPollPushRates = {
    deviceCapabilityPoll: 300,
    endDeviceListPoll: 300,
    functionSetAssignmentsListPoll: 300,
    derProgramListPoll: 300,
    mirrorUsagePointPush: 300,
} as const;
