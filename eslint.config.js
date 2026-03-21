import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  // Global ignores
  {
    ignores: [
      '**/node_modules/',
      '**/.next/',
      '**/dist/',
      '**/build/',
      '**/coverage/',
      '**/.pnpm-store/',
      '**/storybook-static/',
      'e2e/cypress/',
    ],
  },

  // Base JS rules for all files
  js.configs.recommended,

  // Backend — plain JS with Node globals
  {
    files: ['backend/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  // Config files (postcss, tailwind, next) — Node globals
  {
    files: ['**/*.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  // TypeScript files (frontend + UI)
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['frontend/**/*.{ts,tsx}', 'packages/ui/**/*.{ts,tsx}'],
  })),

  // React files (frontend + UI)
  {
    files: ['frontend/**/*.{tsx,jsx}', 'packages/ui/**/*.{tsx,jsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },

  // Storybook stories — relax hooks rule for render functions
  {
    files: ['**/*.stories.{tsx,jsx}'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
    },
  },

  // Test files — Vitest globals + relaxed rules
  {
    files: [
      '**/*.test.{js,ts,tsx}',
      '**/*.spec.{js,ts,tsx}',
      '**/tests/**/*.{js,ts,tsx}',
      '**/__tests__/**/*.{js,ts,tsx}',
    ],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        test: 'readonly',
        beforeAll: 'readonly',
        beforeEach: 'readonly',
        afterAll: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // Disable rules that conflict with Prettier
  prettier,
];
