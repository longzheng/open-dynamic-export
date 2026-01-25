import { writeFile } from 'fs/promises';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { configSchema } from '../src/helpers/config.js';

const jsonSchema = zodToJsonSchema(configSchema, 'config');

await writeFile('./config.schema.json', JSON.stringify(jsonSchema, null, 2));
