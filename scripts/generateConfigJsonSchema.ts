import { writeFile } from 'fs/promises';
import { toJsonSchema } from '@valibot/to-json-schema';
import { configSchema } from '../src/helpers/configSchema.js';

const jsonSchema = toJsonSchema(configSchema);

await writeFile('./config.schema.json', JSON.stringify(jsonSchema, null, 2));
