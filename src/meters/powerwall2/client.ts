import { type Logger } from 'pino';
import { pinoLogger } from '../../helpers/logger.js';
import { type AxiosInstance } from 'axios';
import * as https from 'node:https';
import axios, { AxiosError } from 'axios';
import {
    meterAggregatesSchema,
    metersSiteSchema,
    systemStatusSoeSchema,
} from './api.js';

export class Powerwall2Client {
    private logger: Logger;
    private axiosInstance: AxiosInstance;
    private password: string;
    private token:
        | { type: 'none' }
        | { type: 'fetching'; promise: Promise<string> }
        | { type: 'cached'; token: string } = { type: 'none' };

    constructor({
        ip,
        password,
        timeoutSeconds,
    }: {
        ip: string;
        password: string;
        timeoutSeconds: number;
    }) {
        this.password = password;

        this.logger = pinoLogger.child({ module: 'Powerwall2' });

        this.axiosInstance = axios.create({
            baseURL: `https://${ip}`,
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
            timeout: timeoutSeconds * 1000,
        });

        void this.getToken();
    }

    public async getMeterAggregates() {
        const response = await this.get('/api/meters/aggregates');

        const data = meterAggregatesSchema.parse(response);

        return data;
    }

    public async getSoe() {
        const response = await this.get('/api/system_status/soe');

        const data = systemStatusSoeSchema.parse(response);

        return data;
    }

    public async getMetersSite() {
        const response = await this.get('/api/meters/site');

        const data = metersSiteSchema.parse(response);

        return data;
    }

    private async getToken() {
        switch (this.token.type) {
            case 'cached':
                return this.token.token;
            case 'fetching':
                return this.token.promise;
            case 'none': {
                const promise = (async () => {
                    try {
                        const response = await this.axiosInstance.post(
                            `/api/login/Basic`,
                            {
                                username: 'customer',
                                // the email doesn't seem to actually matter when logging in as customer
                                email: 'a@a.com',
                                password: this.password,
                            },
                        );

                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                        const token = response.data.token as string;

                        this.token = { type: 'cached', token };

                        return token;
                    } catch (error) {
                        this.logger.error(error);

                        throw new Error(`Powerwall2 get token error`);
                    }
                })();

                this.token = { type: 'fetching', promise };

                return promise;
            }
        }
    }

    private async get(
        url: string,
        params?: Record<string, string>,
    ): Promise<unknown> {
        try {
            const response = await this.axiosInstance.get<string>(url, {
                params,
                headers: {
                    Cookie: `AuthCookie=${await this.getToken()}`,
                },
            });

            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                // permissions error
                if (
                    error.response &&
                    error.response.status >= 400 &&
                    error.response.status < 500
                ) {
                    // refresh token and retry request
                    this.token = { type: 'none' };
                    await this.getToken();

                    return this.get(url, params);
                }

                throw error;
            }

            throw error;
        }
    }
}
