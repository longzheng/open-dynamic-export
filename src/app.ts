import express, { json, urlencoded } from 'express';
import cors from 'cors';
import { RegisterRoutes } from '../dist/routes.js';
import swaggerJson from '../dist/swagger.json' with { type: 'json' };
import redoc from 'redoc-express';

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

app.get('/', (_req, res) => {
    res.redirect('/docs');
});

app.get('/docs/swagger.json', (_req, res) => {
    res.json(swaggerJson);
});

app.get(
    '/docs',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    redoc.default({
        title: 'API Documentation',
        specUrl: '/docs/swagger.json',
        redocOptions: {
            expandDefaultResponse: true,
            expandResponses: '200',
        },
    }),
);

RegisterRoutes(app);

app.listen(port, () =>
    console.log(`Server listening at http://localhost:${port}`),
);
