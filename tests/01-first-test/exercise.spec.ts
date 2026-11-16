/**
 * Lesson 01 - exercises, solved.
 *
 * To redo one from scratch, change its `test(` back to `test.fixme(` and
 * delete the body.
 */
import { expect, test } from '../../fixtures/site';

test('exercise 1: the login page has the right heading', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Login Page' })).toBeVisible();
});

test('exercise 2: the home page lists six examples', async ({ page }) => {
  await page.goto('/');
  // Scoped to the list, so the count does not depend on links elsewhere on
  // the page (a footer or a nav added later would not change it).
  await expect(page.getByRole('list').getByRole('link')).toHaveCount(6);
});

test('exercise 3: break a test on purpose and read the report', async ({ page }) => {
  // Broken version: expect(page).toHaveTitle('Wrong').
  // What the report said:
  //   Error: expect(page).toHaveTitle(expected) failed
  //   Expected: "Wrong"
  //   Received: "The Internet"
  // plus a screenshot of the page at the moment of failure
  // (screenshot: 'only-on-failure' in playwright.config.ts) and the line of
  // the test that failed. Expected / Received is the part to read first.
  await page.goto('/');
  await expect(page).toHaveTitle('The Internet');
});
