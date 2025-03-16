import express, { json, urlencoded } from 'express';
import cors from 'cors';
import { RegisterRoutes } from '../dist/routes.js';
import swaggerJson from '../dist/swagger.json' with { type: 'json' };
import redoc from 'redoc-express';
import ViteExpress from 'vite-express';

const port = 3000;

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
