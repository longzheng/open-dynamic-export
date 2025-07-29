import { readFileSync } from 'fs';
import { join } from 'path';
import { type XMLStructuredErrorData } from 'libxmljs';
import { parseXml } from 'libxmljs';

export function validateXml(xml: string):
    | {
          valid: true;
      }
    | {
          valid: false;
          errors: string[];
      } {
    const xmlParsed = parseXml(xml);

    const schemaParsed = parseXml(
        readFileSync(join(process.cwd(), 'envoy-schema/csipaus-core.xsd')),
    );

    // the XSD contains relative imports
    // the validation function will trigger the imports to be resolved relative to the current working directory
    // change working directory temporarily to the schema directory
    const originalCwd = process.cwd();
    const schemaDir = join(originalCwd, 'envoy-schema');
    process.chdir(schemaDir);

    const result = (xmlParsed.validate(schemaParsed) ||
        // the validation errors are dynamically updated in the property after calling .validate()
        xmlParsed.validationErrors) as true | XMLStructuredErrorData[];

    // restore original working directory
    process.chdir(originalCwd);

    if (result === true) {
        return { valid: true };
    } else {
        const actualErrors = result.filter(
            (error) => error.level && error.level > 1,
        );

        console.error(
            'XSD validation errors:',
            actualErrors.map((error) => ({
                message: error.message,
                line: error.line,
            })),
        );

        console.error('Generated XML:');
        console.error(xml);

        return {
            valid: false,
            errors: actualErrors.map((error) => JSON.stringify(error)),
        };
    }
}
