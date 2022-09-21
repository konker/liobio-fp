module.exports = {
  globals: {
    'ts-jest': {
      diagnostics: {
        ignoreCodes: [6133, 6196],
      },
    },
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  rootDir: '.',
  testMatch: ['**/*.test.ts'],
  testPathIgnorePatterns: ['<rootDir>/lib'],
  moduleFileExtensions: ['ts', 'js'],
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/**/*.ts'],
  coveragePathIgnorePatterns: ['<rootDir>/dist', '<rootDir>/integration', '<rootDir>/src/prelude.ts'],
  coverageThreshold: {
    global: {
      branches: 98,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    'src/file/reader/line/CsvObjectFileLineReader.ts': {
      branches: 66,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};
