import express, { json, urlencoded } from 'express';
import { RegisterRoutes } from '../dist/routes.js';
import { env } from './helpers/env.js';

const port = env.SERVER_PORT;

export const app = express();

// Use body parser to read sent json payloads
app.use(
    urlencoded({
        extended: true,
    }),
);
app.use(json());

RegisterRoutes(app);

app.listen(port, () =>
    console.log(`Server listening at http://localhost:${port}`),
);
