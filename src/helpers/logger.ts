import pino from 'pino';

export const logger = pino({
    level: 'trace',
    transport: {
        targets: [
            {
                target: 'pino/file',
                level: 'trace',
                options: { destination: `app.log` },
            },
            {
                target: 'pino-pretty',
                level: 'debug',
            },
        ],
        options: {},
    },
});
