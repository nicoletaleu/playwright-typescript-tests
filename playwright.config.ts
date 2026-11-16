import { defineConfig, devices } from '@playwright/test';

/**
 * No `webServer` block, although Playwright offers one. It starts a single
 * server on a fixed port before the run; tests/fixtures.ts starts one per
 * worker on port 0 instead, the same choice the Robot repo made for
 * PageServer.py: parallel workers can never fight over a port.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  // test.only left in a commit would silently skip the rest of the suite in CI.
  forbidOnly: !!process.env.CI,
  // No retries, locally or in CI. A retry turns a flaky test green and hides
  // it; Robot Day 24 is the long version of why that is the wrong default.
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/junit.xml' }]],
  use: {
    // Kept for every failure, so a red CI run can be opened in the trace
    // viewer instead of being re-run locally to see what happened.
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
