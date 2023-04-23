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
    },
    // {
    //   files: [
    //     'jest.setup.ts',
    //     './tests/**/*.ts',
    //     '**/__tests__/*.test.ts',
    //     '**/__mocks__/*.ts',
    //   ],
    //   plugins: ['jest'],
    //   env: {
    //     'jest/globals': true,
    //   },
    // },
    // {
    //   files: [
    //     './seeds/*.ts',
    //   ],
    //   rules: {
    //     'import/prefer-default-export': 0,
    //   },
    // },
    {
      files: [
        './type-output/types.ts',
      ],
      rules: {
        'no-console': 0,
        'import/no-extraneous-dependencies': [2, { devDependencies: true }],
      },
    },
  ],
};
