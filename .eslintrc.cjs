/* eslint-env node */
/** @type {import('eslint').Linter.Config} */
module.exports = {
    plugins: ['@typescript-eslint', 'prettier'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended-type-checked',
        'plugin:prettier/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
    },
    root: true,
    globals: {
        __dirname: true,
    },
    rules: {
        'no-useless-rename': 'error',
        'no-unreachable': 'warn',
        'object-shorthand': 'error',
        '@typescript-eslint/consistent-type-imports': 'error',
        '@typescript-eslint/switch-exhaustiveness-check': 'error',
        '@typescript-eslint/no-unnecessary-condition': 'error',
    },
    overrides: [
        {
            files: ['*.js', '*.cjs'],
            extends: ['plugin:@typescript-eslint/disable-type-checked'],
        },
    ],
};
