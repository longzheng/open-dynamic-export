import { readFileSync } from 'fs';
import path from 'path';

export function getMockFile(file: string): string {
    const filePath = `${path.join(__dirname, '..', '..', '/tests/sep2/mocks/')}${file}`;

    return readFileSync(filePath, 'utf-8');
}
