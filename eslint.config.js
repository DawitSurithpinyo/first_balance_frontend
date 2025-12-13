import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintReact from "@eslint-react/eslint-plugin";
import eslintJs from "@eslint/js";

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      eslintJs.configs.recommended,
      tseslint.configs.recommended,
      eslintReact.configs["recommended-typescript"],
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      // Use TypeScript ESLint parser for TypeScript files
      parser: tseslint.parser,
      parserOptions: {
        // Enable project service for better TypeScript integration
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    // Custom rule overrides (modify rule levels or disable rules)
    rules: {
      "@eslint-react/no-missing-key": "warn",
      "@eslint-react/naming-convention/component-name": ["warn", { "rule": "PascalCase", "allowAllCaps": true }],
      "@eslint-react/naming-convention/context-name": "warn",
      "@eslint-react/web-api/no-leaked-event-listener": "error",
      "@eslint-react/web-api/no-leaked-interval": "error",
      "@eslint-react/web-api/no-leaked-timeout": "error",
    },
  },
])
