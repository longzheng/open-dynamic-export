import pino from 'pino';

export const logger = pino({
    level: 'trace',
    transport: {
        targets: [
            {
                target: 'pino/file',
                level: 'debug',
                options: { destination: `./logs/debug.log` },
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
