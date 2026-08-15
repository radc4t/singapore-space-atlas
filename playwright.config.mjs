import { defineConfig, devices } from '@playwright/test';

// E2E + visual-regression + accessibility. Run locally with `npm run test:e2e`.
// (Kept out of the default CI job — `npm test` runs the fast node --test data suite; visual
// baselines are platform-specific, so run/refresh e2e where the baselines were generated.)
export default defineConfig({
  testDir: './test',
  testMatch: '**/*.spec.mjs',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:8000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'python3 scripts/nocache_server.py',
    url: 'http://127.0.0.1:8000/',
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
