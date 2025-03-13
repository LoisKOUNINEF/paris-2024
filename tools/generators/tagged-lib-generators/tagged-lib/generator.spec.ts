import { Tree } from '@nx/devkit';
import { libraryGenerator } from '@nx/js';
import { generateTaggedLib } from '../utils/tagged-lib.utils';
import generator from './generator';
import { ITaggedLibGeneratorSchema } from '../interfaces/tagged-lib.interfaces';

jest.mock('@nx/js', () => ({
  libraryGenerator: jest.fn(),
}));

jest.mock('../utils/tagged-lib.utils', () => ({
  generateTaggedLib: jest.fn(),
}));

describe('tagged-lib Generator', () => {
  let tree: Tree;
  let options: ITaggedLibGeneratorSchema;

  beforeEach(() => {
    tree = {} as Tree;
    options = {
      name: 'test-js-lib',
      scope: 'shared',
      type: 'util',
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
