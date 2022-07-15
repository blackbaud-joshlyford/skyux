// This file is auto-generated by running:
// # nx workspace-generator storybook-composition
//
import { StorybookConfig } from '@storybook/core-common';

import * as rootMainImport from '../../../../.storybook/main';

const rootMain = rootMainImport as StorybookConfig;

module.exports = {
  ...rootMain,

  // There needs to be one local story in order for composition to work.
  stories: [
    ...rootMain.stories,
    '../src/lib/**/*.stories.mdx',
    '../src/lib/**/*.stories.@(js|jsx|ts|tsx)',
  ],
};