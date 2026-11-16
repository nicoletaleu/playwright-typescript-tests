/**
 * The Playwright version of resources/local_site.resource.
 *
 * In Robot, Suite Setup starts the page server and publishes ${BASE_URL};
 * Test Setup opens a fresh context. Here both are fixtures:
 *
 * - `site` is worker-scoped: one server per worker process, started on first
 *   use and stopped when the worker ends. Same lifetime as a Robot suite
 *   running under pabot.
 * - `baseURL` is overridden from it, so `page.goto('/login')` works and no
 *   test ever sees a port number.
 *
 * The fresh context per test needs no code at all: Playwright gives every test
 * its own context by default. In Robot that was a keyword I had to remember to
 * call, and Day 24 is what happened before I did.
 */
import { test as base } from '@playwright/test';
import { startSite } from '../site/server';

export const test = base.extend<object, { siteUrl: string }>({
  siteUrl: [
    async ({}, use) => {
      const site = await startSite();
      await use(site.url);
      await site.close();
    },
    { scope: 'worker' },
  ],
  baseURL: async ({ siteUrl }, use) => {
    await use(siteUrl);
  },
});

export { expect } from '@playwright/test';
