import { it, expect, describe } from 'vitest';
import { parseStringPromise } from 'xml2js';
import { getMockFile } from '../helpers/mocks';
import { objectToXml } from '../helpers/xml';
import {
    generateConnectionPointResponse,
    parseConnectionPointXml,
} from './connectionPoint';

describe('parseConnectionPointXml', () => {
    it('should parse connection point XML', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const xml = await parseStringPromise(
            getMockFile('getEdev_cp_csipaus.xml'),
        );

        const connectionPoint = parseConnectionPointXml(xml);

        expect(connectionPoint.connectionPointId).toStrictEqual('1234567890');
    });
});

describe('generateConnectionPointResponse', () => {
    it('should generate connection point XML', () => {
        const response = generateConnectionPointResponse({
            connectionPointId: '1234567890',
        });

        const xml = objectToXml(response);

        expect(xml).toBe(`<?xml version="1.0"?>
<csipaus:ConnectionPoint xmlns:csipaus="https://csipaus.org/ns">
    <csipaus:connectionPointId>1234567890</csipaus:connectionPointId>
</csipaus:ConnectionPoint>`);
    });
});
