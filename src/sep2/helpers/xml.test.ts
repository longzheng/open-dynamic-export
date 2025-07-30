import { it, expect, describe } from 'vitest';
import { objectToXml } from './xml.js';

describe('objectToXml', () => {
    it('should strip undefined values from simple object', () => {
        const obj = {
            root: {
                field1: 'value1',
                field2: undefined,
                field3: 'value3',
            },
        };

        const xml = objectToXml(obj);

        expect(xml).toBe(`<?xml version="1.0"?>
<root>
    <field1>value1</field1>
    <field3>value3</field3>
</root>`);
    });

    it('should strip undefined values from nested objects', () => {
        const obj = {
            root: {
                nested: {
                    keep: 'this',
                    remove: undefined,
                },
                alsoRemove: undefined,
                keep: 'this too',
            },
        };

        const xml = objectToXml(obj);

        expect(xml).toBe(`<?xml version="1.0"?>
<root>
    <nested>
        <keep>this</keep>
    </nested>
    <keep>this too</keep>
</root>`);
    });

    it('should handle arrays with undefined values', () => {
        const obj = {
            root: {
                array: ['keep', undefined, 'also keep'],
            },
        };

        const xml = objectToXml(obj);

        expect(xml).toBe(`<?xml version="1.0"?>
<root>
    <array>keep</array>
    <array>also keep</array>
</root>`);
    });

    it('should strip null and undefined values', () => {
        const obj = {
            root: {
                nullValue: null,
                undefinedValue: undefined,
                keepValue: 'keep',
            },
        };

        const xml = objectToXml(obj);

        expect(xml).toBe(`<?xml version="1.0"?>
<root>
    <keepValue>keep</keepValue>
</root>`);
    });

    it('should handle attributes correctly', () => {
        const obj = {
            root: {
                $: { attr1: 'value1', attr2: undefined },
                content: 'test',
                skipThis: undefined,
            },
        };

        const xml = objectToXml(obj);

        expect(xml).toBe(`<?xml version="1.0"?>
<root attr1="value1">
    <content>test</content>
</root>`);
    });
});
