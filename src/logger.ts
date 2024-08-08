import pino from 'pino';

export const logger = pino({
    level: 'debug',
    transport: {
        targets: [
            {
                target: 'pino/file',
                level: 'debug',
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
