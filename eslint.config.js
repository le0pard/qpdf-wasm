import js from '@eslint/js'
import { includeIgnoreFile } from '@eslint/compat'
import globals from 'globals'
import svelte from 'eslint-plugin-svelte'
import { defineConfig, globalIgnores } from 'eslint/config'
import { fileURLToPath } from 'node:url'

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url))

export default defineConfig([
  includeIgnoreFile(gitignorePath, 'Imported .gitignore patterns'),
  globalIgnores(['src/lib/vendors/**/*', 'wasm/**/*']),
  js.configs.recommended,
  ...svelte.configs.recommended,
  {
    files: [
      'src/**/*.{js,mjs,cjs}',
      'vite.config.js',
      'eslint.config.js'
    ],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: {
      globals: globals.browser
    }
  },
  {
    files: ['**/*.svelte', '**/*.svelte.js'],
    languageOptions: {
      globals: globals.browser
    }
  },
  {
    rules: {
      semi: ['error', 'never'],
      quotes: ['error', 'single']
    }
  }
])
