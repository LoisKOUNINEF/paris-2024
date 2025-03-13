import { Tree } from '@nx/devkit';
import { libraryGenerator } from '@nx/nest';
import { generateTaggedLib } from '../utils/tagged-lib.utils';
import generator from './generator';
import { ITaggedLibGeneratorSchema } from '../interfaces/tagged-lib.interfaces';

jest.mock('@nx/nest', () => ({
  libraryGenerator: jest.fn(),
}));

jest.mock('../utils/tagged-lib.utils', () => ({
  generateTaggedLib: jest.fn(),
}));

describe('nest-tagged-lib Generator', () => {
  let tree: Tree;
  let options: ITaggedLibGeneratorSchema;

  beforeEach(() => {
    tree = {} as Tree;
    options = {
      name: 'test-nest-lib',
      scope: 'server',
      type: 'api',
    };
  });

  it('should call generateTaggedLib with the correct parameters', async () => {
    await generator(tree, options);

    expect(generateTaggedLib).toHaveBeenCalledWith(
      tree,
      options,
      libraryGenerator
    );
  });
});
