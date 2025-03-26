import { INormalizedSchema, ITaggedLibGeneratorSchema } from "../interfaces/tagged-lib.interfaces";
import * as fs from 'node:fs';

export function createSpecConfigFiles(
  options: ITaggedLibGeneratorSchema,
  projectDirectory: INormalizedSchema['projectDirectory'],
  isAngular?: boolean,
) {
  const jestConfigFilePath = `${projectDirectory}/jest.config.ts`;
  const tsconfigSpecFilePath = `${projectDirectory}/tsconfig.spec.json`;

  fs.mkdirSync(projectDirectory, { recursive: true });
  fs.writeFileSync(tsconfigSpecFilePath, tsconfigSpecFileContent);

  if (isAngular) {
    const jestSetupFilePath = `${projectDirectory}/setup-jest.ts`;

    fs.writeFileSync(jestConfigFilePath, angularJestConfigFileContent(options, projectDirectory));
    fs.writeFileSync(jestSetupFilePath, `import 'jest-preset-angular/setup-jest';`);
  } else {
  fs.writeFileSync(jestConfigFilePath, regularJestConfigFileContent(options, projectDirectory));
}
}

export const regularJestConfigFileContent = (
  options: ITaggedLibGeneratorSchema, 
  projectDirectory: INormalizedSchema['projectDirectory']
  ) => `/* eslint-disable */
export default {
  displayName: '${options.scope}-${options.name}',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/${projectDirectory}',
};
`;

export const angularJestConfigFileContent = (
  options: ITaggedLibGeneratorSchema, 
  projectDirectory: INormalizedSchema['projectDirectory']
  ) => `/* eslint-disable */
export default {
  displayName: '${options.scope}-${options.name}',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': ['jest-preset-angular', { tsconfig: '<rootDir>/tsconfig.spec.json', stringifyContentPathRegex: '\\.(html|svg)$' }],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$|lodash-es)'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/${projectDirectory}',
};
`;

const tsconfigSpecFileContent =`{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "types": ["jest", "node"]
  },
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
`;