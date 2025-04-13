const nx = require('@nx/eslint-plugin');

module.exports = [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
          depConstraints: [
              {
                "sourceTag": "scope:client",
                "onlyDependOnLibsWithTags": ["scope:client", "scope:shared"]
              },
              {
                "sourceTag": "scope:server",
                "onlyDependOnLibsWithTags": ["scope:server", "scope:shared"]
              },
              {
                "sourceTag": "scope:shared",
                "onlyDependOnLibsWithTags": ["scope:shared"]
              },
              {
                "sourceTag": "type:presentation",
                "onlyDependOnLibsWithTags": [
                  "type:presentation",
                  "type:business-logic",
                  "type:ui",
                  "type:data-access",
                  "type:util",
                  "type:types"
                ]
              },
              {
                "sourceTag": "type:ui",
                "onlyDependOnLibsWithTags": [
                  "type:data-access",
                  "type:business-logic",
                  "type:ui",
                  "type:util",
                  "type:types"
                ]
              },
              {
                "sourceTag": "type:business-logic",
                "onlyDependOnLibsWithTags": [
                  "type:business-logic",
                  "type:data-access",
                  "type:util",
                  "type:types"
                ]
              },
              {
                "sourceTag": "type:data-access",
                "onlyDependOnLibsWithTags": [
                  "type:data-access",
                  "type:util",
                  "type:types"
                ]
              },
              {
                "sourceTag": "type:util",
                "onlyDependOnLibsWithTags": [
                  "type:util", 
                  "type:types"
                ]
              },
              {
                "sourceTag": "type:types",
                "onlyDependOnLibsWithTags": ["type:types"]
              }
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
  },
];
