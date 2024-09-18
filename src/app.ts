import express, { json, urlencoded } from 'express';
import { RegisterRoutes } from '../dist/routes.js';
import type { Response as ExResponse, Request as ExRequest } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJson from '../dist/swagger.json' with { type: 'json' };

const port = 3000;

export const app = express();

// Use body parser to read sent json payloads
app.use(
    urlencoded({
        extended: true,
    }),
);
app.use(json());

app.get('/', (_req, res) => {
    res.redirect('/docs');
});

app.use('/docs', swaggerUi.serve, (_req: ExRequest, res: ExResponse) => {
    return res.send(swaggerUi.generateHTML(swaggerJson, {}));
});

RegisterRoutes(app);

app.listen(port, () =>
    console.log(`Server listening at http://localhost:${port}`),
);
