import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        exclude: [
            ...configDefaults.exclude,
            'dist/**',
            'logs/**',
            'config/**',
            'docs/**',
        ],
    },
});
