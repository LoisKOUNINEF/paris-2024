import {
  formatFiles,
  getWorkspaceLayout,
  Tree,
  updateJson,
} from '@nx/devkit';
import { Category, Scope, Type, ILibTag, ITaggedLibGeneratorSchema, INormalizedSchema, VALID_SCOPES, VALID_TYPES, ILibOptions, IGeneratorMethod } from "../interfaces/tagged-lib.interfaces";
import { createSpecConfigFiles } from './create-spec-config-files';

export function createTag(category: Category, value: Scope | Type): string {
  return `${category}:${value}`;
}

export function validateLibTag(libTag: ILibTag): boolean {
  return VALID_SCOPES.includes(libTag.scope) && VALID_TYPES.includes(libTag.type);
}

export function normalizeOptions(tree: Tree, options: ITaggedLibGeneratorSchema): INormalizedSchema {
  const libsDir = getWorkspaceLayout(tree).libsDir;
  const projectDirectory = options.directory
  ? options.directory
  : `${libsDir}/${options.scope}/${options.name}/${options.type}`;
  const parsedTags = [createTag('scope', options.scope), createTag('type', options.type)];
  const libTag: ILibTag = { scope: options.scope, type: options.type };
  const name = `${options.scope}-${options.type}-${options.name}`;

  return {
    ...options,
    name,
    projectDirectory,
    parsedTags,
    libTag,
  };
}

export function parseLibOptions(normalizedOptions: INormalizedSchema): ILibOptions {
  return {  
    name: normalizedOptions.name,
    tags: normalizedOptions.parsedTags.join(','),
    directory: normalizedOptions.projectDirectory,
/*
  Following values are defined by default in order
  to ensure consistency and prevent potential issues.
  If modified later on, adapt ../interfaces/tagged-lib-interfaces 
  ILibOptions as well as generators' schemas.
*/
    bundler: 'none',
    compiler: 'swc',
    buildable: false,
    skipFormat: false,
    skipTsConfig: false,
    unitTestRunner: 'jest',
    linter: 'eslint'
  }
}

export function validateSchema(normalizedSchema: INormalizedSchema): void {
  if (!validateLibTag(normalizedSchema)) {
    throw new Error(`Invalid lib tag: scope=${normalizedSchema.scope}, type=${normalizedSchema.type}`);
  }
}

export function updateTsconfigBaseJson(tree: Tree, options: INormalizedSchema) {
  updateJson(tree, 'tsconfig.base.json', (json) => {
    const paths = json.compilerOptions?.paths || {};

    paths[`@paris-2024/${options.name}`] = [
      `${options.projectDirectory}/src/index.ts`,
    ];

    json.compilerOptions = {
      ...json.compilerOptions,
      paths,
    };

    return json;
  });
}

export async function generateTaggedLib(
  tree: Tree, 
  options: ITaggedLibGeneratorSchema, 
  callGenerator: IGeneratorMethod, 
  isAngular?: boolean
): Promise<string> {
  const normalizedOptions = normalizeOptions(tree, options);
  
  validateSchema(normalizedOptions);

  const libOptions: ILibOptions = {
    ...parseLibOptions(normalizedOptions),
    standalone: isAngular,
  };

  callGenerator(tree, libOptions);

  createSpecConfigFiles(
    options,
    normalizedOptions.projectDirectory, 
    isAngular
  )

  updateTsconfigBaseJson(tree, normalizedOptions);

  await formatFiles(tree);

  return normalizedOptions.projectDirectory;
}