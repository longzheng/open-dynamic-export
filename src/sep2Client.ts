import type { AxiosInstance } from 'axios';
import axios from 'axios';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parseStringPromise } from 'xml2js';
import * as https from 'https';
import { safeParseInt } from './number';
import { assertIsString } from './assert';
import { getCertificateLfdi } from './cert';

const USER_AGENT = 'typescript-sep2client';

export class SEP2Client {
    private host: string;
    private dcapUri: string;
    private cert: string;
    private key: string;
    private pen: string;
    private lfdi: string;
    private nsmap: Record<string, string>;
    private sesh: AxiosInstance;

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

        this.nsmap = {
            sep2: 'urn:ieee:std:2030.5:ns',
            csipaus: 'https://csipaus.org/ns',
        };

        this.sesh = axios.create({
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
        const response = await this.sesh.get<string>(url, { params });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await parseStringPromise(response.data);
    }

    public async initialize() {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { tmUri, edevUri, mupUri } = await this.getDeviceCapabilities();
        await this.checkTimeLink(tmUri);
        // Initialize other necessary components
    }

    async getDeviceCapabilities(): Promise<{
        tmUri: string;
        edevUri: string;
        mupUri: string;
    }> {
        /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
        const xml = await this.makeRequest(this.dcapUri);
        const tmUri = xml['DeviceCapability']['TimeLink'][0]['$']['href'];
        const edevUri =
            xml['DeviceCapability']['EndDeviceListLink'][0]['$']['href'];
        const mupUri =
            xml['DeviceCapability']['MirrorUsagePointListLink'][0]['$']['href'];
        /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

        assertIsString(tmUri);
        assertIsString(edevUri);
        assertIsString(mupUri);

        return { tmUri, edevUri, mupUri };
    }

    async checkTimeLink(tmUri: string) {
        /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
        const xml = await this.makeRequest(tmUri);
        const timeUtc = xml['Time']['currentTime'][0];
        /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

        assertIsString(timeUtc);

        const timeUtcInt = safeParseInt(timeUtc);

        const dt = new Date(timeUtcInt * 1000);
        const now = new Date();
        const delta = now.getTime() - dt.getTime();

        if (Math.abs(delta) > 60000) {
            // 1 minute in milliseconds
            throw new Error(
                `Clock is not synced with Utility Server, delta ${delta}ms`,
            );
        }
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
