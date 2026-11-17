/**
 * Lesson 01 - the first test.
 *
 * A Playwright test is an async function that receives fixtures - here only
 * `page`, a fresh browser tab - and drives it with `await`. Every action and
 * every web-first assertion returns a promise; a missing `await` is the most
 * common beginner bug, because the test moves on before the browser has done
 * anything.
 *
 * `test` and `expect` come from fixtures/site.ts instead of
 * '@playwright/test'. That file starts the local site and sets `baseURL`, so
 * `page.goto('/')` opens it without a port number in the test.
 *
 * Run only this lesson:  npx playwright test tests/01-first-test
 */
import { expect, test } from '../../fixtures/site';

test('the home page opens', async ({ page }) => {
  await page.goto('/');

  // Web-first assertions retry until they pass or time out, so they double as
  // the wait. No sleep anywhere in this repo.
  await expect(page).toHaveTitle('The Internet');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Welcome to the-internet');
});

test('a link takes you to another page', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Form Authentication' }).click();

  // toHaveURL with a regular expression: the base URL changes every run (the
  // port is random), so only the path is worth asserting.
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Login Page' })).toBeVisible();
});

test('test.step names the parts of a longer test', async ({ page }) => {
  // Steps show up in the HTML report and the trace as a tree, which turns
  // "the test failed at line 40" into "the test failed while logging in".
  await test.step('open the home page', async () => {
    await page.goto('/');
  });

  await test.step('go to the JavaScript Alerts example', async () => {
    await page.getByRole('link', { name: 'JavaScript Alerts' }).click();
  });

  await test.step('check where we landed', async () => {
    await expect(page.getByRole('heading', { name: 'JavaScript Alerts' })).toBeVisible();
  });
});
