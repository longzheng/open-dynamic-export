// @ts-check
import js from '@eslint/js';
import tseslint, { configs } from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginImportX from 'eslint-plugin-import-x';
import tsParser from '@typescript-eslint/parser';

export default tseslint.config(
    {
        ignores: [
            'dist/',
            'logs/',
            'src/limiters/negativeFeedIn/amber/api.d.ts',
            'docs/.vitepress/cache',
            'docs/.vitepress/dist',
            'docs/babel.config.js',
        ],
    },
    js.configs.recommended,
    eslintPluginImportX.flatConfigs.recommended,
    eslintPluginImportX.flatConfigs.typescript,
    {
        files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
        ignores: ['eslint.config.js'],
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 'latest',
            sourceType: 'module',
        },
        rules: {
            'no-unused-vars': 'off',
            'import-x/no-dynamic-require': 'warn',
            'import-x/consistent-type-specifier-style': [
                'error',
                'prefer-inline',
            ],
        },
    },
    ...configs.recommendedTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                project: ['./tsconfig.json'],
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    eslintConfigPrettier,
    eslintPluginPrettierRecommended,
    {
        rules: {
            'no-useless-rename': 'error',
            'no-unreachable': 'warn',
            'object-shorthand': 'error',
            '@typescript-eslint/consistent-type-imports': 'error',
            '@typescript-eslint/switch-exhaustiveness-check': 'error',
            '@typescript-eslint/no-unnecessary-condition': 'error',
            '@typescript-eslint/no-unused-vars': 'warn',
        },
    },
);
