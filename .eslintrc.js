'use strict';

module.exports = {
  root: true,
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    sourceType: 'script',
    ecmaVersion: 2022,
  },
  rules: {
    strict: [2, 'global'],
  },
  overrides: [
    {
      files: ['**/*.ts'],
      extends: [
        'airbnb-base',
        'airbnb-typescript/base',
      ],
      parserOptions: {
        project: './tsconfig.json',
      },
      rules: {
        '@typescript-eslint/lines-between-class-members': 0,
      },
    },
    {
      files: [
        'jest.setup.ts',
        './tests/**/*.ts',
        '**/__tests__/*.test.ts',
        '**/__mocks__/*.ts',
      ],
      plugins: ['jest'],
      env: {
        'jest/globals': true,
      },
    },
    {
      files: [
        './tests/env.ts',
      ],
      rules: {
        'import/no-mutable-exports': 0,
      },
    },
  ],
};
