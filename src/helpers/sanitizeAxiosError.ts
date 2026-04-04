import type { AxiosError } from 'axios';

export function sanitizeAxiosError(error: AxiosError) {
    const { config, response, message, code, status } = error;

    return {
        message,
        code,
        status,
        response: response
            ? {
                  status: response.status,
                  statusText: response.statusText,
                  headers: response.headers,
                  data: response.data,
              }
            : undefined,
        config: config
            ? {
                  headers: config.headers,
                  baseURL: config.baseURL,
                  method: config.method,
                  url: config.url,
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  data: config.data,
                  'axios-retry': config['axios-retry'],
              }
            : undefined,
    };
}
