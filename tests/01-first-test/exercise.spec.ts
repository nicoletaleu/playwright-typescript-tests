/**
 * Lesson 01 - exercises.
 *
 * Each test below is marked test.fixme(): Playwright reports it as skipped and
 * CI stays green. To do an exercise:
 *   1. change `test.fixme(` to `test(`;
 *   2. write the body;
 *   3. run `npx playwright test tests/01-first-test` until it passes.
 *
 * A lesson counts as done when all of its exercises run and pass.
 */
import { expect, test } from '../../fixtures/site';

test.fixme('exercise 1: the login page has the right heading', async ({ page }) => {
  // Open '/login' and assert that a heading named "Login Page" is visible.
  // Hint: page.getByRole('heading', { name: ... })
  void page;
  void expect;
});

test.fixme('exercise 2: the home page lists six examples', async ({ page }) => {
  // Open '/' and assert that the list under "Available Examples" has 6 links.
  // Hint: expect(locator).toHaveCount(n)
  void page;
});

test.fixme('exercise 3: break a test on purpose and read the report', async ({ page }) => {
  // Write a test that expects the wrong title, run it, then run
  // `npx playwright show-report` and find the failure in the report.
  // Write in this comment what the report told you, then fix the test.
  void page;
});
