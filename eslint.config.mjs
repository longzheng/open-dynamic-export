// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
    {
        ignores: [
            'dist/',
            'logs/',
            'src/limiters/negativeFeedIn/amber/api.d.ts',
        ],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
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
