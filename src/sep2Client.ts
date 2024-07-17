import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parseStringPromise } from 'xml2js';
import { ModbusClient } from './modbusClient';

const USER_AGENT = 'typescript-sep2client';

export class SEP2Client {
    private host: string;
    private dcapUri: string;
    private certPath: string;
    private keyPath: string;
    private pen: string;
    private lfdi: string;
    private nsmap: Record<string, string>;
    private modbusClient: ModbusClient;

    constructor(
        host: string,
        dcapUri: string,
        certPath: string,
        keyPath: string,
        pen: number,
        modbusHost: string,
        modbusPort: number,
    ) {
        this.host = host;
        this.dcapUri = dcapUri;
        this.certPath = resolve(certPath);
        this.keyPath = resolve(keyPath);
        this.pen = pen.toString().padStart(8, '0');
        this.lfdi = this.getCertificateLfdi(this.certPath).replace(/-/g, '');

        this.nsmap = {
            sep2: 'urn:ieee:std:2030.5:ns',
            csipaus: 'https://csipaus.org/ns',
        };

        this.modbusClient = new ModbusClient(modbusHost, modbusPort);
    }

    private getCertificateLfdi(certPath: string): string {
        // Placeholder function to get certificate LFDI, implementation needed
        return '0000000000000000000000000000000000000000';
    }

    private async getResponse(
        link: string,
        params: Record<string, any> = {},
    ): Promise<any> {
        const url = new URL(`${this.host}${link}`);
        Object.keys(params).forEach((key) =>
            url.searchParams.append(key, params[key]),
        );

        const cert = readFileSync(this.certPath);
        const key = readFileSync(this.keyPath);

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'User-Agent': USER_AGENT,
                Accept: 'application/sep+xml',
                'Content-Type': 'application/sep+xml',
            },
            agent: new (require('https').Agent)({
                cert,
                key,
                rejectUnauthorized: false, // Skip certificate check for now
            }),
        });

        if (!response.ok) {
            throw new Error(
                `Network response was not ok: ${response.statusText}`,
            );
        }

        const text = await response.text();
        return await parseStringPromise(text);
    }

    public async initialize() {
        const [tmUri, edevUri, mupUri] = await this.getDeviceCapabilities();
        this.checkTimeLink(tmUri);
        // Initialize other necessary components
    }

    private async getDeviceCapabilities(): Promise<[string, string, string]> {
        const xml = await this.getResponse(this.dcapUri);
        const tmUri =
            xml['sep2:DeviceCapability']['sep2:TimeLink'][0]['$']['href'];
        const edevUri =
            xml['sep2:DeviceCapability']['sep2:EndDeviceListLink'][0]['$'][
                'href'
            ];
        const mupUri =
            xml['sep2:DeviceCapability']['sep2:MirrorUsagePointListLink'][0][
                '$'
            ]['href'];
        return [tmUri, edevUri, mupUri];
    }

    private async checkTimeLink(tmUri: string) {
        const xml = await this.getResponse(tmUri);
        const timeUtc = parseInt(xml['sep2:Time']['sep2:currentTime'][0], 10);
        const dt = new Date(timeUtc * 1000);
        const now = new Date();
        const delta = now.getTime() - dt.getTime();

        if (Math.abs(delta) > 60000) {
            // 1 minute in milliseconds
            throw new Error('Clock is not synced with Utility Server');
        }
    }

    public async handleDERControl() {
        // Example to get DERControl events and apply to Modbus
        const derControlUri = '/path/to/dercontrol'; // Update with actual path
        const xml = await this.getResponse(derControlUri);

        const derControls = xml['sep2:DERControlList']['sep2:DERControl'];
        for (const control of derControls) {
            const exportLimit =
                control['sep2:DERControlBase'][0]['csipaus:opModExLimW'][0];
            const importLimit =
                control['sep2:DERControlBase'][0]['csipaus:opModImLimW'][0];
            await this.modbusClient.setExportLimit(exportLimit);
            await this.modbusClient.setImportLimit(importLimit);
        }
    }
}
