import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'src-tauri/target'] },
  {
    files: ['src/**/*.{ts,tsx}', 'scripts/**/*.ts', 'test/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      // The dead PlaygroundTools import in App.tsx that caused a real UI bug
      // (a panel silently double-mounted while the "unused" import looked
      // harmless) is exactly what this rule exists to catch.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' }],
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Legacy schemas and pipeline glue code intentionally use `any` in a
      // few spots (see project.ts comments) - keep it a warning, not a hard
      // error, rather than sprinkling disable comments everywhere.
      '@typescript-eslint/no-explicit-any': 'warn',
      // Only the two classic hooks rules, not v7's full React-Compiler-
      // oriented "recommended" bundle (set-state-in-effect, globals, purity,
      // etc.) - this codebase predates those rules and the sync-state-from-
      // props useEffect pattern used throughout (CommitTitleInput and
      // friends) is a deliberate, tested, idiomatic choice, not a bug to
      // flag on every lint run.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
);
