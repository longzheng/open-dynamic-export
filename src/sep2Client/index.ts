import type { AxiosInstance } from 'axios';
import axios from 'axios';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parseStringPromise } from 'xml2js';
import * as https from 'https';
import { getCertificateLfdi } from '../cert';
import type { DeviceCapabilityResponse } from './deviceCapability';
import { parseDeviceCapabilityXml } from './deviceCapability';
import { parseTimeXml } from './time';
import { parseEndDeviceListXml } from './endDeviceList';

const USER_AGENT = 'open-dynamic-export';

export class SEP2Client {
    private host: string;
    private dcapUri: string;
    private cert: string;
    private key: string;
    private pen: string;
    private lfdi: string;
    private axiosInstance: AxiosInstance;

    constructor({
        host,
        dcapUri,
        certPath,
        keyPath,
        pen,
    }: {
        host: string;
        dcapUri: string;
        certPath: string;
        keyPath: string;
        pen: number;
    }) {
        this.host = host;
        this.dcapUri = dcapUri;
        this.cert = readFileSync(resolve(certPath), 'utf-8');
        this.key = readFileSync(resolve(keyPath), 'utf-8');
        this.pen = pen.toString().padStart(8, '0');
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

    private async makeRequest(
        link: string,
        params?: Record<string, string>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Promise<any> {
        const url = `${this.host}${link}`;
        const response = await this.axiosInstance.get<string>(url, { params });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await parseStringPromise(response.data);
    }

    public async initialize() {
        const { timeLink, endDeviceListLink } =
            await this.getDeviceCapabilities();
        await this.assertTimeDelta(timeLink.href);

        await this.getEndDeviceList(endDeviceListLink.href);
    }

    async getDeviceCapabilities(): Promise<DeviceCapabilityResponse> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const xml = await this.makeRequest(this.dcapUri);

        return parseDeviceCapabilityXml(xml);
    }

    // ensure the utility server time and the client time is not out of sync
    async assertTimeDelta(timeHref: string) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const xml = await this.makeRequest(timeHref);

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
        const xml = await this.makeRequest(endDeviceListHref);

        return parseEndDeviceListXml(xml);
    }

    public async handleDERControl() {
        // Example to get DERControl events and apply to Modbus
        const derControlUri = '/path/to/dercontrol'; // Update with actual path
        /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
        const xml = await this.makeRequest(derControlUri);
        const derControls = xml['DERControlList']['DERControl'];
        /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

        for (const control of derControls) {
            /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const exportLimit =
                control['DERControlBase'][0]['ns2:opModExpLimW'][0];
            /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
            // TODO Apply exportLimit to Modbus
        }
    }
}

// default polling and post rates for resources
// extracted from page 16 of SEP2 Client Handbook
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const defaultIntervalSeconds = {
    DeviceCapability: 300,
    EndDeviceList: 300,
    FunctionSetAssignmentsList: 300,
    DERProgramList: 300,
    MirrorUsagePoint: 300,
};
