// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('@angular-eslint/eslint-plugin');
const angularTemplate = require('@angular-eslint/eslint-plugin-template');
const templateParser = require('@angular-eslint/template-parser');

/**
 * Reglas de calidad del frontend. Complementan el análisis de SonarQube:
 * ESLint da feedback inmediato en el editor y en el pre-commit.
 */
module.exports = tseslint.config(
  {
    ignores: ['node_modules/**', 'dist/**', '.angular/**', 'coverage/**', 'playwright-report/**', 'test-results/**'],
  },
  {
    files: ['**/*.ts'],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended, ...tseslint.configs.stylistic],
    plugins: { '@angular-eslint': angular },
    rules: {
      // Angular: convenciones y buenas prácticas
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'app', style: 'kebab-case' }],
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'app', style: 'camelCase' }],
      '@angular-eslint/no-empty-lifecycle-method': 'error',
      '@angular-eslint/use-lifecycle-interface': 'error',
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      '@angular-eslint/prefer-standalone': 'error',
      '@angular-eslint/no-output-native': 'error',
      '@angular-eslint/no-input-rename': 'error',
      '@angular-eslint/no-output-rename': 'error',
      '@angular-eslint/prefer-signals': 'warn',

      // TypeScript
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

      // Generales / mantenibilidad
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-var': 'error',
      'prefer-const': 'error',
      complexity: ['warn', 10],
      'max-lines': ['warn', { max: 250, skipBlankLines: true, skipComments: true }],
      'max-depth': ['warn', 3],
    },
  },
  {
    // Las pruebas pueden usar aserciones no nulas y archivos más extensos
    files: ['**/*.spec.ts', 'src/test-setup.ts', 'src/testing/**/*.ts', 'e2e/**/*.ts'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      'max-lines': 'off',
      '@angular-eslint/prefer-on-push-component-change-detection': 'off',
    },
  },
  {
    // Las pruebas E2E reportan métricas de rendimiento por consola
    files: ['e2e/**/*.ts'],
    rules: { 'no-console': 'off' },
  },
  {
    files: ['**/*.html'],
    plugins: { '@angular-eslint/template': angularTemplate },
    languageOptions: { parser: templateParser },
    rules: {
      ...angularTemplate.configs.recommended.rules,
      // Accesibilidad
      ...angularTemplate.configs.accessibility.rules,
      '@angular-eslint/template/prefer-control-flow': 'error',
      '@angular-eslint/template/prefer-self-closing-tags': 'warn',
      '@angular-eslint/template/no-negated-async': 'error',
    },
  },
);
