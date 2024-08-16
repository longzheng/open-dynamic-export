import type { AxiosInstance, AxiosResponse } from 'axios';
import axios, { AxiosError } from 'axios';
import { parseStringPromise } from 'xml2js';
import * as https from 'node:https';
import { getCertificateLfdi } from '../cert';
import type { Config } from '../config';
import type { RoleFlagsType } from './models/roleFlagsType';
import { numberToHex } from '../number';
import { randomUUID } from 'node:crypto';
import { DeviceCapabilityHelper } from './helpers/deviceCapability';

const USER_AGENT = 'open-dynamic-export';

export class SEP2Client {
    private host: string;
    private dcapUri: string;
    private pen: string;
    public lfdi: string;
    private axiosInstance: AxiosInstance;

    constructor({
        sep2Config,
        cert,
        key,
    }: {
        sep2Config: Pick<Config['sep2'], 'host' | 'dcapUri' | 'pen'>;
        cert: string;
        key: string;
    }) {
        this.host = sep2Config.host;
        this.dcapUri = sep2Config.dcapUri;
        this.pen = sep2Config.pen.toString().padStart(8, '0');
        this.lfdi = getCertificateLfdi(cert);

        this.axiosInstance = axios.create({
            baseURL: this.host,
            headers: {
                'User-Agent': USER_AGENT,
                Accept: 'application/sep+xml',
                'Content-Type': 'application/sep+xml',
            },
            httpsAgent: new https.Agent({
                cert,
                key,
                rejectUnauthorized: false,
            }),
        });
    }

    async get(
        link: string,
        params?: Record<string, string>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Promise<any> {
        const url = `${this.host}${link}`;
        const response = await this.axiosInstance.get<string>(url, { params });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await parseStringPromise(response.data);
    }

    async post(
        link: string,
        data: unknown,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Promise<AxiosResponse> {
        const url = `${this.host}${link}`;
        const response = await this.axiosInstance.post<string>(url, data);
        return response;
    }

    async put(
        link: string,
        data: unknown,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Promise<AxiosResponse> {
        const url = `${this.host}${link}`;
        const response = await this.axiosInstance.put<string>(url, data);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return response;
    }

    public discover() {
        return new DeviceCapabilityHelper({
            client: this,
            href: this.dcapUri,
        });
    }

    // async postDerControlResponse(
    //     replyToHref: string,
    //     response: DerControlResponse,
    // ) {
    //     const data = generateDerControlResponse(response);
    //     const xml = objectToXml(data);
    //     return await this.postResponse(replyToHref, xml);
    // }

    generateUsagePointMrid(roleFlags: RoleFlagsType) {
        return `${this.lfdi.substring(0, 22)}${numberToHex(roleFlags).padStart(2, '0')}${this.pen}`;
    }

    generateMeterReadingMrid() {
        return `${randomUUID().replace(/-/g, '').substring(0, 24)}${this.pen}`;
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
