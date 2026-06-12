import { Agent } from 'undici';
import type { Logger } from 'pino';
import * as v from 'valibot';
import { pinoLogger } from '../../helpers/logger.js';
import {
    FetchHttpError,
    fetchWithError,
    type FetchRequestConfig,
} from '../../helpers/fetch.js';
import { sanitizeFetchError } from '../../helpers/sanitizeFetchError.js';
import {
    meterAggregatesSchema,
    metersSiteSchema,
    systemStatusSoeSchema,
} from './api.js';

export class Powerwall2Client {
    private logger: Logger;
    private baseUrl: string;
    private dispatcher: Agent;
    private timeoutMilliseconds: number;
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
        this.baseUrl = `https://${ip}`;
        this.timeoutMilliseconds = timeoutSeconds * 1000;
        this.dispatcher = new Agent({
            connect: {
                rejectUnauthorized: false,
            },
        });

        // prefetch token
        void this.getToken().catch(() => {
            // noop, will retry on next request
        });
    }

    public async getMeterAggregates({ signal }: { signal: AbortSignal }) {
        const response = await this.get('/api/meters/aggregates', { signal });

        const data = v.parse(meterAggregatesSchema, response);

        return data;
    }

    public async getSoe({ signal }: { signal: AbortSignal }) {
        const response = await this.get('/api/system_status/soe', { signal });

        const data = v.parse(systemStatusSoeSchema, response);

        return data;
    }

    public async getMetersSite({ signal }: { signal: AbortSignal }) {
        const response = await this.get('/api/meters/site', { signal });

        const data = v.parse(metersSiteSchema, response);

        return data;
    }

    private getSignal(signal?: AbortSignal) {
        return signal
            ? AbortSignal.any([
                  AbortSignal.timeout(this.timeoutMilliseconds),
                  signal,
              ])
            : AbortSignal.timeout(this.timeoutMilliseconds);
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
                        const response = await fetchWithError<{
                            token: string;
                        }>(`${this.baseUrl}/api/login/Basic`, {
                            method: 'POST',
                            dispatcher: this.dispatcher,
                            signal: this.getSignal(),
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                username: 'customer',
                                // the email doesn't seem to actually matter when logging in as customer
                                email: 'a@a.com',
                                password: this.password,
                            }),
                        });

                        const token = response.data.token;

                        this.token = { type: 'cached', token };

                        return token;
                    } catch (error) {
                        this.logger.error(
                            {
                                error:
                                    error instanceof FetchHttpError
                                        ? sanitizeFetchError(error)
                                        : error,
                            },
                            'Powerwall2 login error',
                        );

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
        options?: Omit<FetchRequestConfig<never>, 'headers'>,
        retryCount = 0,
    ): Promise<unknown> {
        try {
            const response = await fetchWithError(`${this.baseUrl}${url}`, {
                ...options,
                dispatcher: this.dispatcher,
                signal: this.getSignal(options?.signal ?? undefined),
                method: 'GET',
                headers: {
                    Cookie: `AuthCookie=${await this.getToken()}`,
                },
            });

            return response.data;
        } catch (error) {
            if (error instanceof FetchHttpError && error.response) {
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
