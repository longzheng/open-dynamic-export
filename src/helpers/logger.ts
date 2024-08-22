import pino from 'pino';

export const logger = pino({
    level: 'trace',
    transport: {
        targets: [
            {
                target: 'pino/file',
                level: 'debug',
                options: { destination: `app.log` },
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
