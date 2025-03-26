import * as fs from 'node:fs';
import { createSpecConfigFiles, angularJestConfigFileContent, regularJestConfigFileContent } from './create-spec-config-files';
import { ITaggedLibGeneratorSchema } from '../interfaces/tagged-lib.interfaces';

jest.mock('node:fs', () => ({
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

describe('createSpecConfigFiles', () => {
  const options: ITaggedLibGeneratorSchema = {
    scope: 'client',
    name: 'testLib',
    type: 'ui',
  };

  const projectDirectory = 'libs/test-lib';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create Jest and tsconfig spec files for non-Angular projects', () => {
    createSpecConfigFiles(options, projectDirectory, false);

    expect(fs.mkdirSync).toHaveBeenCalledWith(projectDirectory, { recursive: true });

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      `${projectDirectory}/tsconfig.spec.json`,
      expect.any(String)
    );

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      `${projectDirectory}/jest.config.ts`,
      regularJestConfigFileContent(options, projectDirectory)
    );
  });

  it('should create Jest, tsconfig spec, and setup-jest.ts files for Angular projects', () => {
    createSpecConfigFiles(options, projectDirectory, true);

    expect(fs.mkdirSync).toHaveBeenCalledWith(projectDirectory, { recursive: true });

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      `${projectDirectory}/tsconfig.spec.json`,
      expect.any(String)
    );

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      `${projectDirectory}/jest.config.ts`,
      angularJestConfigFileContent(options, projectDirectory)
    );

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      `${projectDirectory}/setup-jest.ts`,
      `import 'jest-preset-angular/setup-jest';`
    );
  });

  it('should handle recursive directory creation correctly', () => {
    createSpecConfigFiles(options, projectDirectory);

    expect(fs.mkdirSync).toHaveBeenCalledWith(projectDirectory, { recursive: true });
  });
});
