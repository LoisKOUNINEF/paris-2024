/* eslint-disable */
export default {
  displayName: 'client-presentation-staff',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\.(ts|mjs|js|html)$': ['jest-preset-angular', { tsconfig: '<rootDir>/tsconfig.spec.json', stringifyContentPathRegex: '\.(html|svg)$' }],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\.mjs$|lodash-es)'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../../coverage/libs/client/presentation/staff',
};
