import { generateTaggedLib } from './tagged-lib.utils';
import { Tree } from '@nx/devkit';
import { ITaggedLibGeneratorSchema } from '../interfaces/tagged-lib.interfaces';
import { createSpecConfigFiles } from './create-spec-config-files';

jest.mock('@nx/devkit', () => ({
  formatFiles: jest.fn(),
  installPackagesTask: jest.fn(),
  updateJson: jest.fn(),
  getWorkspaceLayout: () => ({ libsDir: 'libs' }),
}));

jest.mock('./create-spec-config-files', () => ({
  createSpecConfigFiles: jest.fn(),
}));

describe('generateTaggedLib', () => {
  let tree: Tree;
  let options: ITaggedLibGeneratorSchema;
  let callGenerator: jest.Mock;

  beforeEach(() => {
    tree = {} as Tree;
    options = {
      name: 'test-lib',
      scope: 'client',
      type: 'ui',
    };
    callGenerator = jest.fn();
  });
  afterEach(() => {
    jest.clearAllMocks();
  })

  it('should call the library generator', async () => {
    await generateTaggedLib(tree, options, callGenerator);

    expect(callGenerator).toHaveBeenCalled();
  });

  it('should call createSpecConfigFiles for non-Angular library generation', async () => {
    await generateTaggedLib(tree, options, callGenerator);
    expect(createSpecConfigFiles).toHaveBeenCalledWith(options, `libs/${options.scope}/${options.name}/${options.type}`, undefined);
  });

  it('should call createSpecConfigFiles for Angular library generation', async () => {
    await generateTaggedLib(tree, options, callGenerator, true);
    expect(createSpecConfigFiles).toHaveBeenCalledWith(options, `libs/${options.scope}/${options.name}/${options.type}`, true);
  });
});
