import { defineConfig, devices } from '@playwright/test';

// e2e for the Workday adapter's real DOM read/write. Bundles the adapter before the run
// (globalSetup) and injects it into the fixture page. Separate from the Vitest unit suite.
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: true,
  reporter: 'list',
  use: { ...devices['Desktop Chrome'] },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
