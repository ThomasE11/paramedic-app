/**
 * Standalone Vitest config.
 *
 * Deliberately does NOT import vite.config.ts — that file registers the
 * ElevenLabs dev-proxy plugin and build-time chunking that tests don't need,
 * and keeping this file independent means concurrent changes to vite.config.ts
 * can't break the test runner. Only the `@` → ./src alias is replicated.
 *
 * These are pure clinical-logic unit tests: node environment, no DOM.
 */
import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
