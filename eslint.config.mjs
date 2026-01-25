import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import { includeIgnoreFile } from '@eslint/compat';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginImportX from 'eslint-plugin-import-x';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import tailwind from 'eslint-plugin-tailwindcss';
import pluginRouter from '@tanstack/eslint-plugin-router';

export default defineConfig(
    includeIgnoreFile(import.meta.dirname + `/.gitignore`),
    {
        ignores: [
            'dist/',
            'logs/',
            'src/setpoints/negativeFeedIn/amber/api.d.ts',
            'src/ui/gen/',
            'docs/.vitepress/cache',
            'docs/.vitepress/dist',
            'docs/babel.config.js',
        ],
    },
    eslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    eslintConfigPrettier,
    eslintPluginPrettierRecommended,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
            },
        },
    },
    {
        files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
        extends: [
            reactPlugin.configs.flat['recommended'],
            reactPlugin.configs.flat[`jsx-runtime`],
            eslintPluginImportX.flatConfigs.recommended,
            eslintPluginImportX.flatConfigs.typescript,
            pluginRouter.configs[`flat/recommended`],
            reactHooks.configs.flat['recommended-latest'],
            tailwind.configs[`flat/recommended`],
        ],
        settings: {
            react: {
                version: `detect`,
            },
            tailwindcss: {
                callees: [`classnames`, `clsx`, `ctl`, `cn`, `cva`],
            },
            'import-x/resolver-next': [
                createTypeScriptImportResolver({
                    alwaysTryTypes: true,
                    project: 'tsconfig.json',
                }),
            ],
        },
        rules: {
            'no-unused-vars': 'off',
            'import-x/first': `error`,
            'import-x/newline-after-import': [
                `error`,
                {
                    considerComments: true,
                },
            ],
            'import-x/order': [
                `error`,
                {
                    'newlines-between': `never`,
                },
            ],
            'no-useless-rename': 'error',
            'no-unreachable': 'warn',
            'object-shorthand': 'error',
            '@typescript-eslint/consistent-type-imports': [
                'error',
                { prefer: 'type-imports' },
            ],
            '@typescript-eslint/no-import-type-side-effects': 'error',
            '@typescript-eslint/switch-exhaustiveness-check': 'error',
            '@typescript-eslint/no-unnecessary-condition': 'error',
            '@typescript-eslint/no-unused-vars': 'warn',
            // disable import rules that affect performance and are already covered by Typescript
            // https://typescript-eslint.io/troubleshooting/typed-linting/performance/#eslint-plugin-import
            'import-x/named': `off`,
            'import-x/default': `off`,
            'import-x/namespace': `off`,
            'import-x/no-named-as-default-member': `off`,
            'import-x/no-unresolved': `off`,
        },
    },
    {
        files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
        extends: [tseslint.configs.disableTypeChecked],
    },
);
