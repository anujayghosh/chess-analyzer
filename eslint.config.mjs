/** @type {import("eslint").Linter.FlatConfig[]} */
import nextEslint from '@next/eslint-plugin-next';
import { eslintrc } from '@eslint/eslintrc';

const { FlatCompat } = eslintrc;
const compat = new FlatCompat({
  baseDirectory: process.cwd(),
  recommendedConfig: {},
});

export default [
  ...compat.config({
    extends: ['next/core-web-vitals', 'plugin:prettier/recommended'],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/exhaustive-deps": "off"
    },
  }),
  {
    plugins: {
      next: nextEslint,
    },
  },
];
