import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  timeout: 90_000,
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:43871', browserName: 'chromium', trace: 'retain-on-failure' },
  webServer: {
    command: 'node scripts/serve-export.mjs',
    env: { PORT: '43871' },
    url: 'http://127.0.0.1:43871/docs',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
