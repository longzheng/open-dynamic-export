import pino from 'pino';

export const logger = pino({
    level: 'trace',
    transport: {
        targets: [
            {
                target: 'pino-rotating-file-stream',
                level: 'debug',
                options: { filename: 'debug.log', path: `./logs/` },
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
