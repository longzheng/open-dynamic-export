import { XmlDocument, XsdValidator } from 'libxml2-wasm';
import { xmlRegisterFsInputProviders } from 'libxml2-wasm/lib/nodejs.mjs';
import fs from 'node:fs';

// allow XML include to work in Node.js environment
// https://jameslan.github.io/libxml2-wasm/v0.5/documents/Parsing_and_Serializing.html#nodejs
xmlRegisterFsInputProviders();

// cache the XsdValidator instance to be re-used across tests
let validator: XsdValidator | undefined;

export function validateXml(xml: string):
    | {
          valid: true;
      }
    | {
          valid: false;
          errors: string[];
      } {
    validator =
        validator ??
        XsdValidator.fromDoc(
            XmlDocument.fromBuffer(
                fs.readFileSync('envoy-schema/csipaus-core.xsd'),
                {
                    url: 'envoy-schema/csipaus-core.xsd',
                },
            ),
        );

    try {
        using doc = XmlDocument.fromString(xml);
        validator.validate(doc);

        return { valid: true };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error);

        console.error('XML validation error:', errorMessage);
        console.error('Generated XML:');
        console.error(xml);

        return {
            valid: false,
            errors: [errorMessage],
        };
    }
}
