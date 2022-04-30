// @ts-check

const fs = require('fs')
const path = require('path')

// eslint-disable-next-line no-nested-ternary
const tsConfig = fs.existsSync('tsconfig.json')
  ? path.resolve('tsconfig.json')
  : fs.existsSync('types/tsconfig.json')
  ? path.resolve('types/tsconfig.json')
  : undefined

/** @type {import("eslint").Linter.Config} */
const eslintConfig = {
  env: {
    browser: true,
    node: true,
  },
  extends: [
    require.resolve('@vercel/style-guide/eslint/_base'),
    require.resolve('@vercel/style-guide/eslint/react'),
    require.resolve('@vercel/style-guide/eslint/next'),
    'plugin:prettier/recommended',
  ],
  plugins: ['simple-import-sort', 'tailwindcss', 'unused-imports'],
  rules: {
    '@next/next/no-img-element': ['off'],
    'import/extensions': ['off'],
    'import/newline-after-import': ['warn'],
    'import/order': ['off'],
    'no-console': ['warn'],
    'no-unused-vars': ['off'],
    'react/function-component-definition': ['off'],
    'react/jsx-sort-props': ['warn', { reservedFirst: ['key'] }],
    'simple-import-sort/exports': ['warn'],
    'simple-import-sort/imports': ['warn'],
    'sort-imports': ['off'],
    'tailwindcss/classnames-order': ['warn'],
    'unicorn/filename-case': ['error', { cases: { camelCase: true, kebabCase: true, pascalCase: true } }],
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
    ],
  },
  overrides: [
    {
      files: ['**/*.d.ts', '**/*.ts', '**/*.tsx'],
      extends: [require.resolve('@vercel/style-guide/eslint/typescript'), 'plugin:prettier/recommended'],
      parserOptions: {
        project: tsConfig,
      },
      rules: {
        '@typescript-eslint/no-misused-promises': ['warn'],
        '@typescript-eslint/no-unsafe-argument': ['warn'],
        '@typescript-eslint/no-unsafe-assignment': ['warn'],
        '@typescript-eslint/no-unsafe-member-access': ['warn'],
        '@typescript-eslint/no-unsafe-return': ['warn'],
        '@typescript-eslint/no-unused-vars': ['off'],
      },
    },
    {
      files: ['pages/**/*.{js,jsx,ts,tsx}', 'next.config.{js,cjs,mjs}'],
      rules: {
        'import/no-default-export': ['off'],
      },
    },
  ],
}

module.exports = eslintConfig
