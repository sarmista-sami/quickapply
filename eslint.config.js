import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['.output', '.wxt', 'node_modules', 'e2e/.tmp', 'e2e/.pw-profile*', 'e2e/capture/*.json'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // TypeScript/WXT resolve globals and undefined vars; ESLint's no-undef only causes
    // false positives on DOM/node globals here.
    rules: {
      'no-undef': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    // Core layers must stay browser-agnostic (AGENTS.md rule 2).
    files: ['src/core/**/*.ts'],
    rules: {
      'no-restricted-globals': ['error', 'chrome', 'document', 'window'],
    },
  },
  {
    // Test + capture scripts: pragmatic globals and casts allowed.
    files: ['**/*.test.ts', 'e2e/**/*.ts', 'e2e/**/*.mjs'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);
