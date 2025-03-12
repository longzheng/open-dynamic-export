import js from '@eslint/js';
import tseslint, { configs } from 'typescript-eslint';
// eslint-disable-next-line import-x/default
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginImportX from 'eslint-plugin-import-x';
// eslint-disable-next-line import-x/default
import tsParser from '@typescript-eslint/parser';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import reactPlugin from 'eslint-plugin-react';
// eslint-disable-next-line import-x/default
import reactHooks from 'eslint-plugin-react-hooks';
import tailwind from 'eslint-plugin-tailwindcss';
import pluginRouter from '@tanstack/eslint-plugin-router';

export default tseslint.config(
    {
        ignores: [
            'dist/',
            'logs/',
            'src/limiters/negativeFeedIn/amber/api.d.ts',
            'src/ui/gen/',
            'docs/.vitepress/cache',
            'docs/.vitepress/dist',
            'docs/babel.config.js',
        ],
    },
    {
        files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
        extends: [
            js.configs.recommended,
            eslintConfigPrettier,
            eslintPluginPrettierRecommended,
            configs.recommendedTypeChecked,
            reactPlugin.configs.flat['recommended'] ?? {},
            reactPlugin.configs.flat[`jsx-runtime`] ?? {},
            eslintPluginImportX.flatConfigs.recommended,
            eslintPluginImportX.flatConfigs.typescript,
            pluginRouter.configs[`flat/recommended`],
            reactHooks.configs['recommended-latest'],
            tailwind.configs[`flat/recommended`],
        ],
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 'latest',
            sourceType: 'module',
            parserOptions: {
                projectService: true,
                project: [
                    'tsconfig.server.json',
                    'tsconfig.ui.json',
                    'tsconfig.node.json',
                ],
                tsconfigRootDir: import.meta.dirname,
            },
        },
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
                    project: [
                        `tsconfig.server.json`,
                        `tsconfig.ui.json`,
                        `tsconfig.node.json`,
                    ],
                }),
            ],
        },
        rules: {
            'no-unused-vars': 'off',
            'import-x/no-dynamic-require': 'warn',
            'import-x/consistent-type-specifier-style': [
                'error',
                'prefer-inline',
            ],
            'no-useless-rename': 'error',
            'no-unreachable': 'warn',
            'object-shorthand': 'error',
            '@typescript-eslint/consistent-type-imports': 'error',
            '@typescript-eslint/switch-exhaustiveness-check': 'error',
            '@typescript-eslint/no-unnecessary-condition': 'error',
            '@typescript-eslint/no-unused-vars': 'warn',
        },
    },
    {
        files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
        extends: [configs.disableTypeChecked],
    },
);
