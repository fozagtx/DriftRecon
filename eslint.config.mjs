import js from '@eslint/js';
export default [js.configs.recommended, { ignores: ['.svelte-kit/**','.next/**','build/**','src/**/*.svelte','tests/**/*.tsx','lib/**/*.ts','tests/**/*.ts','src/**/*.ts','vite.config.ts','vitest.config.ts','svelte.config.js'] }];
