import { AxiosError } from 'axios';
import { pino, stdTimeFunctions, stdSerializers } from 'pino';

export const pinoLogger = pino({
    level: 'trace',
    base: null, // disable PID and hostname
    timestamp: stdTimeFunctions.isoTime, // write ISO time to log file
    serializers: {
        ...stdSerializers,
        err: (error) => {
            if (error instanceof AxiosError) {
                return {
                    message: error.message,
                    code: error.code,
                    url: error.config?.url,
                    method: error.config?.method,

                    request: error.request
                        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                          { headers: error.request?.getHeaders?.() }
                        : undefined,
                    response: error.response
                        ? {
                              status: error.response.status,
                              headers: error.response.headers,
                              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                              data: error.response.data,
                          }
                        : undefined,
                };
            }

            if (error instanceof Error) {
                return stdSerializers.err(error);
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return error;
        },
    },
    transport: {
        targets: [
            {
                target: 'pino-rotating-file-stream',
                // this uses an environment variable because we don't want additional dependencies
                level: process.env['LOGLEVEL'] ?? 'debug',
                options: {
                    filename: 'debug.log',
                    path: `./logs/`,
                    // maximum each log
                    size: '10MB',
                    // maximum all logs
                    maxSize: '1G',
                    // use immutable files (disables GZIP of old logs)
                    immutable: true,
                },
            },
            {
                target: 'pino-rotating-file-stream',
                level: 'error',
                options: {
                    filename: 'error.log',
                    path: `./logs/`,
                    // maximum each log
                    size: '10MB',
                    // maximum all logs
                    maxSize: '100MB',
                    // use immutable files (disables GZIP of old logs)
                    immutable: true,
                },
            },
            {
                target: 'pino-pretty',
                level: 'info',
                options: {
                    singleLine: true,
                },
            },
        ],
        options: {},
    },
});
