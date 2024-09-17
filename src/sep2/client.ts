import type { AxiosInstance, AxiosResponse } from 'axios';
import axios, { AxiosError } from 'axios';
import { parseStringPromise } from 'xml2js';
import * as https from 'node:https';
import {
    getCertificateFingerprint,
    getCertificateLfdi,
    getCertificateSfdi,
} from './helpers/cert.js';
import type { Config } from '../helpers/config.js';
import type { RoleFlagsType } from './models/roleFlagsType.js';
import { numberToHex } from '../helpers/number.js';
import { createHash } from 'node:crypto';
import { DeviceCapabilityHelper } from './helpers/deviceCapability.js';
import axiosRetry from 'axios-retry';

const USER_AGENT = 'open-dynamic-export';

export class SEP2Client {
    private readonly host: string;
    private readonly dcapUri: string;
    public readonly pen: string;
    public readonly lfdi: string;
    public readonly sfdi: string;
    private readonly axiosInstance: AxiosInstance;

    constructor({
        sep2Config,
        cert,
        key,
        pen,
    }: {
        sep2Config: Pick<
            NonNullable<Config['limiters']['sep2']>,
            'host' | 'dcapUri'
        >;
        cert: string;
        key: string;
        pen: string;
    }) {
        this.host = sep2Config.host;
        this.dcapUri = sep2Config.dcapUri;
        this.pen = pen.padStart(8, '0');

        const certificateFingerprint = getCertificateFingerprint(cert);

        this.lfdi = getCertificateLfdi(certificateFingerprint);
        this.sfdi = getCertificateSfdi(certificateFingerprint);

        const axiosClient = axios.create({
            baseURL: this.host,
            headers: {
                'User-Agent': USER_AGENT,
                Accept: 'application/sep+xml',
                'Content-Type': 'application/sep+xml',
            },
            httpsAgent: new https.Agent({
                cert,
                key,
                // the device certificate will have the full chain
                ca: cert,
                // the IEEE2023.5 certifiate does not have the host name as the certificate altnames
                // bypass the server identity check
                checkServerIdentity: () => undefined,
            }),
        });

        // exponential backoff retry
        axiosRetry(axiosClient, {
            retryDelay: (retryCount, error) =>
                axiosRetry.exponentialDelay(retryCount, error),
        });

        this.axiosInstance = axiosClient;
    }

    async get(link: string, params?: Record<string, string>): Promise<unknown> {
        try {
            const url = `${this.host}${link}`;
            const response = await this.axiosInstance.get<string>(url, {
                params,
            });

            return await parseStringPromise(response.data);
        } catch (error) {
            if (error instanceof AxiosError) {
                throw new Error(
                    `SEP2Client GET error
message: ${error.message}
url: ${error.config?.url}
response status: ${error.response?.status}
response data: ${JSON.stringify(error.response?.data, null, 2)}`,
                );
            }

            throw error;
        }
    }

    async post(link: string, data: unknown): Promise<AxiosResponse> {
        try {
            const url = `${this.host}${link}`;
            const response = await this.axiosInstance.post<string>(url, data);
            return response;
        } catch (error) {
            if (error instanceof AxiosError) {
                throw new Error(
                    `SEP2Client POST error
message: ${error.message}
url: ${error.config?.url}
request data: ${JSON.stringify(data, null, 2)}
response status: ${error.response?.status}
response data: ${JSON.stringify(error.response?.data, null, 2)}`,
                );
            }

            throw error;
        }
    }

    async put(link: string, data: unknown): Promise<AxiosResponse> {
        try {
            const url = `${this.host}${link}`;
            const response = await this.axiosInstance.put<string>(url, data);

            return response;
        } catch (error) {
            if (error instanceof AxiosError) {
                throw new Error(
                    `SEP2Client PUT error
message: ${error.message}
url: ${error.config?.url}
request data: ${JSON.stringify(data, null, 2)}
response status: ${error.response?.status}
response data: ${JSON.stringify(error.response?.data, null, 2)}`,
                );
            }

            throw error;
        }
    }

    public discover() {
        return new DeviceCapabilityHelper({
            client: this,
            href: this.dcapUri,
        });
    }

    // From the SEP2 Client Handbook
    // A suggested naming pattern for the Usage Point mRID(s) could include a truncated LFDI with the role flags, in addition to a PEN
    generateUsagePointMrid(roleFlags: RoleFlagsType) {
        return `${this.lfdi.substring(0, 22)}${numberToHex(roleFlags).padStart(2, '0')}${this.pen}`;
    }

    // From the SEP2 Client Handbook
    // The mRID of each MeterReading needs to be unique for that EndDevice
    // hash the description to generate a consistent mRID for the "type" of MeterReadingMrid
    generateMeterReadingMrid(description: string) {
        return `${createHash('sha256').update(description).digest('hex').substring(0, 24).toUpperCase()}${this.pen}`;
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
};
