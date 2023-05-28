'use strict';

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  globalSetup: '<rootDir>/tests/setup.ts',
  globalTeardown: '<rootDir>/tests/teardown.ts',
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup-env.ts',
  ],
  testMatch: [
    '<rootDir>/**/__tests__/*.spec.ts',
  ],
};
