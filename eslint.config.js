import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
export default tseslint.config({ ignores: ['dist/**','src/legacy/**'] }, js.configs.recommended, ...tseslint.configs.recommended, { files: ['**/*.js'], languageOptions: { globals: { ...globals.browser, ...globals.node } } }, { files: ['**/*.{ts,tsx}'], languageOptions: { globals: { ...globals.browser, ...globals.node } }, plugins: { 'react-hooks': reactHooks }, rules: { ...reactHooks.configs.recommended.rules, eqeqeq: ['error','always'], 'no-var': 'error', 'prefer-const': 'error', 'no-eval': 'error', 'no-alert': 'error', 'no-debugger': 'error' } });
