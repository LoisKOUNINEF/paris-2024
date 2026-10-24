const baseConfig = require('../../../eslint.config.js');

module.exports = [
  ...baseConfig,
  {
    files: ['**/*.json'],
    languageOptions: {
      parser: require('jsonc-eslint-parser'),
    },
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: ['{projectRoot}/esbuild.config.{js,ts,mjs,mts}'],
        },
      ],
    },
  },
];
