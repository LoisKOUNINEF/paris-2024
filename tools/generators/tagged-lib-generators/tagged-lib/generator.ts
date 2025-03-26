import { Tree } from '@nx/devkit';
import { libraryGenerator } from '@nx/js';
import { ITaggedLibGeneratorSchema } from '../interfaces/tagged-lib.interfaces';
import { generateTaggedLib } from '../utils/tagged-lib.utils';

export default async function (
  tree: Tree,
  options: ITaggedLibGeneratorSchema,
) {
  const projectDirectory = await generateTaggedLib(tree, options, libraryGenerator);
// easiest way to 'prevent' package.json generation by removing it
// repeated in ../nest-tagged-lib/generator
  const packageJsonPath = `${projectDirectory}/package.json`;
  
  if (projectDirectory && tree.exists(packageJsonPath)) {
    tree.delete(packageJsonPath);
  };
}