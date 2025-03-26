import { Tree } from '@nx/devkit';
import { libraryGenerator } from '@nx/angular/generators';
import { generateTaggedLib } from '../utils/tagged-lib.utils';
import generator from './generator';
import { ITaggedLibGeneratorSchema } from '../interfaces/tagged-lib.interfaces';

jest.mock('@nx/angular/generators', () => ({
  libraryGenerator: jest.fn(),
}));

jest.mock('../utils/tagged-lib.utils', () => ({
  generateTaggedLib: jest.fn(),
}));

describe('angular-tagged-lib Generator', () => {
  let tree: Tree;
  let options: ITaggedLibGeneratorSchema;

  beforeEach(() => {
    tree = {} as Tree;
    options = {
      name: 'test-lib',
      scope: 'client',
      type: 'ui',
    };
  });

  it('should call generateTaggedLib with the correct parameters', async () => {
    await generator(tree, options);

    expect(generateTaggedLib).toHaveBeenCalledWith(
      tree,
      options,
      libraryGenerator,
      true
    );
  });
});
