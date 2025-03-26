import { Tree } from '@nx/devkit';
import { libraryGenerator } from '@nx/angular/generators';
import { ITaggedLibGeneratorSchema } from '../interfaces/tagged-lib.interfaces';
import { generateTaggedLib } from '../utils/tagged-lib.utils';

export default async function (tree: Tree, options: ITaggedLibGeneratorSchema) {
  await generateTaggedLib(tree, options, libraryGenerator, true);
}
