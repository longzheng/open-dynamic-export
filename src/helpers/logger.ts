import pino, { stdTimeFunctions } from 'pino';

export const logger = pino({
    level: 'trace',
    base: null, // disable PID and hostname
    timestamp: stdTimeFunctions.isoTime, // write ISO time to log file
    transport: {
        targets: [
            {
                target: 'pino-rotating-file-stream',
                level: 'debug',
                options: {
                    filename: 'debug.log',
                    path: `./logs/`,
                    // maximum each log
                    size: '10MB',
                    // maximum all logs
                    maxSize: '1G',
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
