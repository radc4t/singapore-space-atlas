// ESLint 9 flat config for the vanilla-ES-modules app.
import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    // dist/ is build output; .agents/ + skills-lock.json are locally-installed agent-skill tooling
    // (third-party, gitignored) that must not be linted as project source.
    ignores: ['dist/**', 'node_modules/**', '.agents/**', 'skills-lock.json'],
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // Node scripts (build, data validation) run in Node, not the browser.
    files: ['scripts/**/*.mjs', 'test/**/*.mjs', 'test/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node },
    },
  },
];
