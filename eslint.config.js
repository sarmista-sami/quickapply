import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['.output', '.wxt', 'node_modules'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Core layers must stay browser-agnostic (AGENTS.md rule 2).
    files: ['src/core/**/*.ts'],
    rules: {
      'no-restricted-globals': ['error', 'chrome', 'document', 'window'],
    },
  },
);
