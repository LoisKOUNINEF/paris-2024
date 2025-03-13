import { Tree } from "@nx/devkit";

export const VALID_SCOPES = ['client', 'server', 'shared'] as const;
export const VALID_TYPES = ['business-logic', 'presentation', 'ui', 'data-access', 'util', 'types', 'api'] as const;

export type Scope = typeof VALID_SCOPES[number];
export type Type = typeof VALID_TYPES[number];
export type Category = 'scope' | 'type';

export interface ILibTag {
  scope: Scope;
  type: Type;
}

export interface ILibOptions {
  name: string;
  tags: string;
  directory: string;
/*
  Following values are defined by default for ease of use and to ensure consistency and prevent potential issues.
  If modified later on, adapt ../utils/tagged-lib-utils parseLibOptions method as well as generators' schemas.
*/
  bundler: 'none';
  compiler: 'swc';
  buildable: false;
  skipFormat: false;
  skipTsConfig: false;
  unitTestRunner: any;
  linter: 'eslint';
  standalone?: boolean;
}

export interface ITaggedLibGeneratorSchema {
  name: string;
  directory?: string;
  scope: Scope;
  type: Type;
}

export interface INormalizedSchema extends ITaggedLibGeneratorSchema {
  projectDirectory: string;
  parsedTags: Array<string>;
  libTag: ILibTag;
}

export interface IGeneratorMethod {
  (
  tree: Tree,
  libOptions: ILibOptions,
  ): void
}
