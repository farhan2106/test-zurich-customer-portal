// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      // Relax rules that conflict with NestJS / Express / test patterns
      '@typescript-eslint/unbound-method': 'off',          // NestJS providers, Passport guards, Express middleware use unbound methods
      '@typescript-eslint/no-unsafe-assignment': 'off',     // Test mocks and Passport req.user casting need any
      '@typescript-eslint/no-unsafe-member-access': 'off',  // Dynamic property access in tests and guards
      '@typescript-eslint/no-unsafe-call': 'off',           // Test mock calls
      '@typescript-eslint/no-unsafe-return': 'off',         // Mock return values in tests
      // Keep strict rules that catch real issues
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/require-await': 'error',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
);
