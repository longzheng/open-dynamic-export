import { writeFile } from 'fs/promises';
import { toJsonSchema } from '@valibot/to-json-schema';
import { configObjectSchema } from '../src/helpers/config.js';

const jsonSchema = toJsonSchema(configObjectSchema);

await writeFile('./config.schema.json', JSON.stringify(jsonSchema, null, 2));
