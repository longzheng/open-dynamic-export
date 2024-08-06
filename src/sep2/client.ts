import type { AxiosInstance, AxiosResponse } from 'axios';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import * as https from 'node:https';
import { getCertificateLfdi } from '../cert';
import type { DeviceCapabilityResponse } from './models/deviceCapability';
import { parseDeviceCapabilityXml } from './models/deviceCapability';
import { parseTimeXml } from './models/time';
import { parseEndDeviceListXml } from './models/endDeviceList';
import type { DerControlResponse } from './models/derControlResponse';
import { generateDerControlResponse } from './models/derControlResponse';
import { objectToXml } from './helpers/xml';
import type { Config } from '../config';
import type { RoleFlagsType } from './models/roleFlagsType';
import { numberToHex } from '../number';
import { randomUUID } from 'node:crypto';

const USER_AGENT = 'open-dynamic-export';

export class SEP2Client {
    private host: string;
    private dcapUri: string;
    private cert: string;
    private key: string;
    private pen: string;
    private lfdi: string;
    private axiosInstance: AxiosInstance;
    private cachedDeviceCapabilities: DeviceCapabilityResponse | null = null;

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
        this.cert = cert;
        this.key = key;
        this.pen = sep2Config.pen.toString().padStart(8, '0');
        this.lfdi = getCertificateLfdi(this.cert);

        this.axiosInstance = axios.create({
            baseURL: this.host,
            headers: {
                'User-Agent': USER_AGENT,
                Accept: 'application/sep+xml',
                'Content-Type': 'application/sep+xml',
            },
            httpsAgent: new https.Agent({
                cert: this.cert,
                key: this.key,
                rejectUnauthorized: false, // Skip certificate check for now
            }),
        });
    }

    private async getRequest(
        link: string,
        params?: Record<string, string>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Promise<any> {
        const url = `${this.host}${link}`;
        const response = await this.axiosInstance.get<string>(url, { params });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await parseStringPromise(response.data);
    }

    private async postResponse(
        link: string,
        data: unknown,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Promise<AxiosResponse> {
        const url = `${this.host}${link}`;
        const response = await this.axiosInstance.post<string>(url, data);
        return response;
    }

    private async putResponse(
        link: string,
        data: unknown,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Promise<AxiosResponse> {
        const url = `${this.host}${link}`;
        const response = await this.axiosInstance.put<string>(url, data);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return response;
    }

    public async discovery() {
        this.cachedDeviceCapabilities = await this.getDeviceCapabilities();

        await this.getTime(this.cachedDeviceCapabilities.timeLink.href);
    }

    async getDeviceCapabilities(): Promise<DeviceCapabilityResponse> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const xml = await this.getRequest(this.dcapUri);

        return parseDeviceCapabilityXml(xml);
    }

    // ensure the utility server time and the client time is not out of sync
    async getTime(timeHref: string) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const xml = await this.getRequest(timeHref);

        const time = parseTimeXml(xml);

        const now = new Date();
        const delta = now.getTime() - time.currentTime.getTime();

        if (Math.abs(delta) > 60000) {
            // 1 minute in milliseconds
            throw new Error(
                `Clock is not synced with Utility Server, delta ${delta}ms`,
            );
        }
    }

    async getEndDeviceList(endDeviceListHref: string) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const xml = await this.getRequest(endDeviceListHref, {
            // get all records
            // start
            s: '0',
            // length
            l: '255',
        });

        return parseEndDeviceListXml(xml);
    }

    async postDerControlResponse(
        replyToHref: string,
        response: DerControlResponse,
    ) {
        const data = generateDerControlResponse(response);
        const xml = objectToXml(data);
        return await this.postResponse(replyToHref, xml);
    }

    generateUsagePointMrid(roleFlags: RoleFlagsType) {
        return `${this.lfdi.substring(0, 22)}${numberToHex(roleFlags).padStart(2, '0')}${this.pen}`;
    }

    generateMeterReadingMrid() {
        return `${randomUUID().replace(/-/g, '').substring(0, 24)}${this.pen}`;
    }
}

// default polling and post rates for resources
// extracted from page 16 of SEP2 Client Handbook
export const defaultIntervalSeconds = {
    DeviceCapability: 300,
    EndDeviceList: 300,
    FunctionSetAssignmentsList: 300,
    DERProgramList: 300,
    MirrorUsagePoint: 300,
};
