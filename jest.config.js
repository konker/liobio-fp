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
  roots: ['src'],
  moduleFileExtensions: ['ts', 'js'],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};
