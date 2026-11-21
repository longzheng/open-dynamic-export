import type { FetchHttpError } from './fetch.js';

export function sanitizeFetchError(error: FetchHttpError) {
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
                  method: config.method,
                  url: config.url,
                  body: config.body,
                  retry: config.retry,
              }
            : undefined,
    };
}
