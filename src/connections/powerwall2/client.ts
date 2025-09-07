import { type Logger } from 'pino';
import { pinoLogger } from '../../helpers/logger.js';
import { type AxiosRequestConfig, type AxiosInstance } from 'axios';
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

    public async getMeterAggregates({ signal }: { signal: AbortSignal }) {
        const response = await this.get('/api/meters/aggregates', { signal });

        const data = meterAggregatesSchema.parse(response);

        return data;
    }

    public async getSoe({ signal }: { signal: AbortSignal }) {
        const response = await this.get('/api/system_status/soe', { signal });

        const data = systemStatusSoeSchema.parse(response);

        return data;
    }

    public async getMetersSite({ signal }: { signal: AbortSignal }) {
        const response = await this.get('/api/meters/site', { signal });

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
                        this.logger.error(error, 'Powerwall2 login error');

                        this.token = { type: 'none' };

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
        options?: Omit<AxiosRequestConfig<never>, 'headers'>,
        retryCount = 0,
    ): Promise<unknown> {
        try {
            const response = await this.axiosInstance.get<string>(url, {
                ...options,
                headers: {
                    Cookie: `AuthCookie=${await this.getToken()}`,
                },
            });

            return response.data;
        } catch (error) {
            if (error instanceof AxiosError && error.response) {
                this.logger.error(error, 'Powerwall2 API get error');

                // permissions error
                if (
                    error.response.status >= 400 &&
                    error.response.status < 500 &&
                    retryCount < 1
                ) {
                    this.logger.info('Refreshing Powerwall2 token');

                    // refresh token and retry request
                    this.token = { type: 'none' };
                    await this.getToken();

                    this.logger.info('Retrying Powerwall2 API get');
                    return this.get(url, options, retryCount + 1);
                }

                throw error;
            }

            throw error;
        }
    }
}
