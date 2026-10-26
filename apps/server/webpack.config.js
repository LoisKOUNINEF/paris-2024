// These options were migrated by @nx/webpack:convert-to-inferred from
// the project.json file and merged with the options in this file
const configValues = {
  build: {
    default: {
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: [
        './src/assets',
        {
          glob: '**/*.hbs',
          input: '../../libs/server/mailer/business-logic/src/lib',
          output: 'src/mailer',
        },
      ],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
      outputPath: '../../dist/apps/server',
    },
    development: { optimization: false, extractLicenses: false, inspect: true },
    production: { optimization: true, extractLicenses: true, inspect: false },
  },
};

// Determine the correct configValue to use based on the configuration
const configuration = process.env.NX_TASK_TARGET_CONFIGURATION || 'default';

const buildOptions = {
  ...configValues.build.default,
  ...configValues.build[configuration],
};
const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/server'),
  },
  plugins: [new NxAppWebpackPlugin(buildOptions)],
};
