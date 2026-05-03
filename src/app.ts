import express, { json, urlencoded } from 'express';
import cors from 'cors';
import redoc from 'redoc-express';
import ViteExpress from 'vite-express';
import { RegisterRoutes } from './tsoa/routes.js';
import swaggerJson from './tsoa/swagger.json' with { type: 'json' };
import { env } from './helpers/env.js';
import { pinoLogger } from './helpers/logger.js';

const port = env.SERVER_PORT;

// Build provenance — populated by Dockerfile ARG/ENV from `docker compose
// build` args (see scripts/build-and-restart.sh in the home-fronius-inverters
// repo). Logged once at startup so the running version is always visible
// alongside the operational logs (not just in `docker inspect` labels).
pinoLogger.info(
    {
        gitSha: process.env['GIT_SHA'] ?? 'unknown',
        gitBranch: process.env['GIT_BRANCH'] ?? 'unknown',
        buildDate: process.env['BUILD_DATE'] ?? 'unknown',
        nodeEnv: process.env['NODE_ENV'] ?? 'unknown',
    },
    'open-dynamic-export starting',
);

export const app = express();

// Use body parser to read sent json payloads
app.use(
    urlencoded({
        extended: true,
    }),
);
app.use(json());
app.use((cors as (options: cors.CorsOptions) => express.RequestHandler)({}));

app.get('/api', (_req, res) => {
    // redirect to docs
    res.redirect('/api/docs');
});

app.get('/api/docs/swagger.json', (_req, res) => {
    res.json(swaggerJson);
});

app.get(
    '/api/docs',
    redoc.default({
        title: 'API Documentation',
        specUrl: '/api/docs/swagger.json',
        redocOptions: {
            expandDefaultResponse: true,
            expandResponses: '200',
        },
    }),
);

RegisterRoutes(app);

// the docker image will not contain `vite.config.ts`
// specify the outDir inline
ViteExpress.config({
    inlineViteConfig: {
        build: {
            outDir: './dist/ui',
        },
    },
});

ViteExpress.listen(app, port, () =>
    console.log(`Server listening at http://localhost:${port}`),
);
