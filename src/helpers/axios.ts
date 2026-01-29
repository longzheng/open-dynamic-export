import { AxiosError } from 'axios';

// the AxiosError object can be very large due to the config object, we only want to extract a few of the properties for logging
export function getAxiosErrorCleaned(error: unknown) {
    if (error instanceof AxiosError) {
        const { config, ...rest } = error;

        return {
            ...rest,
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

    return error;
}
