const js = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const globals = require('globals');

module.exports = [
   {
      ignores: ['build/**', 'node_modules/**'],
   },
   {
      ...js.configs.recommended,
      languageOptions: {
         ...js.configs.recommended.languageOptions,
         globals: {
            ...globals.node,
         },
      },
   },
   {
      files: ['**/*.ts'],
      languageOptions: {
         ecmaVersion: 'latest',
         sourceType: 'module',
         parser: tsParser,
         parserOptions: {
            project: ['./tsconfig.json'],
            tsconfigRootDir: __dirname,
         },
         globals: {
            ...globals.browser,
            ...globals.es2021,
            ...globals.node,
         },
      },
      plugins: {
         '@typescript-eslint': tseslint,
      },
      rules: {
         ...tseslint.configs.recommended.rules,
         semi: 'off',
         '@typescript-eslint/no-floating-promises': ['error'],
      },
   },
];
