/* eslint-disable */
export default {
  displayName: 'server-utils',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/libs/server/utils',
};
