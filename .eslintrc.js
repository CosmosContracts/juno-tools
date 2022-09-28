// @ts-check

const { TYPESCRIPT_FILES } = require('@strangelovelabs/style-guide/eslint/constants')
const { getTsconfigPath } = require('@strangelovelabs/style-guide/eslint/helpers')

/** @type {import("eslint").Linter.Config} */
const eslintConfig = {
  extends: [
    require.resolve('@strangelovelabs/style-guide/eslint/browser-node'),
    require.resolve('@strangelovelabs/style-guide/eslint/react'),
    require.resolve('@strangelovelabs/style-guide/eslint/next'),
    require.resolve('@strangelovelabs/style-guide/eslint/typescript'),
    require.resolve('@strangelovelabs/style-guide/eslint/tailwindcss'),
  ],
  ignorePatterns: ['.next', 'node_modules', 'out'],
  parserOptions: {
    project: getTsconfigPath(),
  },
  rules: {
    '@next/next/no-img-element': ['off'],
    'no-console': ['warn'],
    'react/function-component-definition': ['off'],
    'unicorn/filename-case': ['off'],
  },
  overrides: [
    {
      files: TYPESCRIPT_FILES,
      rules: {
        '@typescript-eslint/no-misused-promises': ['warn'],
        '@typescript-eslint/no-unsafe-argument': ['warn'],
        '@typescript-eslint/no-unsafe-assignment': ['warn'],
        '@typescript-eslint/no-unsafe-member-access': ['warn'],
        '@typescript-eslint/no-unsafe-return': ['warn'],
      },
    },
  ],
  root: true,
}

module.exports = eslintConfig
