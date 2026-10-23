import path from 'node:path';

import { defineConfig } from 'vitest/config';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

const configDir = path.join(import.meta.dirname, '.storybook');

// Stories run in jsdom by default. Stories that need real layout, focus or
// rendering (floating-ui positioning, virtualization, editors, charts) carry the
// `browser` tag and run in headless Chrome instead.
const BROWSER_TAG = 'browser';

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    maxWorkers: 2,
    pool: 'vmThreads',
    projects: [
      {
        extends: true,
        plugins: [storybookTest({ configDir, tags: { exclude: [BROWSER_TAG] } })],
        test: {
          name: 'storybook',
          environment: 'jsdom',
          setupFiles: [
            path.join(import.meta.dirname, '../../packages/ui/src/test/setup.ts'),
            path.join(configDir, 'vitest.jsdom-setup.tsx'),
          ],
        },
      },
      {
        extends: true,
        plugins: [storybookTest({ configDir, tags: { include: [BROWSER_TAG] } })],
        test: {
          name: 'storybook-browser',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({ launchOptions: { channel: 'chrome' } }),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
