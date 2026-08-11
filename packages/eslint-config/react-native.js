import { baseConfig } from './base.js';

/** @type {import("eslint").Linter.Config[]} */
export const reactNativeConfig = [
  ...baseConfig,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
];
