/* eslint-disable */
export default {
  displayName: 'server-business-logic-bundle',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/libs/server/business-logic-bundle',
};
