import { defineConfig } from '@kubb/core';
import { pluginOas } from '@kubb/plugin-oas';
import { pluginTs } from '@kubb/swagger-ts';
import { pluginTanstackQuery } from '@kubb/swagger-tanstack-query';

export default defineConfig(() => {
    return {
        root: '.',
        input: {
            path: './dist/swagger.json',
        },
        output: {
            path: './src/ui/gen',
            clean: false,
        },
        plugins: [
            pluginOas({
                output: false,
            }),
            pluginTs({
                output: {
                    // output as a single file
                    path: './types.ts',
                    exportType: false,
                },
            }),
            pluginTanstackQuery({
                output: {
                    // output as a single file
                    path: './hooks.ts',
                    exportType: false,
                },
                client: {
                    importPath: '../client.ts',
                },
                framework: 'react',
                dataReturnType: 'full',
                mutate: {
                    variablesType: 'hook',
                    methods: ['post', 'put', 'delete'],
                },
                query: {
                    methods: ['get'],
                    importPath: '@tanstack/react-query',
                },
                suspense: {},
            }),
        ],
    };
});
