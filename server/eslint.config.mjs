// eslint.config.mjs
import { js } from '@eslint/js';
import globals from 'globals';

export default {
  root: true,
  languageOptions: {
    parser: '@typescript-eslint/parser',
    parserOptions: {
      tsconfigRootDir: process.cwd(),
      project: './tsconfig.json',
      sourceType: 'module',
    },
    globals: {
      ...globals.node,
      ...globals.jest,
    },
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:prettier/recommended',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-floating-promises': 'warn',
    '@typescript-eslint/no-unsafe-argument': 'warn',
  },
  ignorePatterns: ['eslint.config.mjs'],
};
