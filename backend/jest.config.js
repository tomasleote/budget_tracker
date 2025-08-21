module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: [
    '**/?(*.)+(spec|test).ts'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 30000,
  collectCoverage: false,
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
