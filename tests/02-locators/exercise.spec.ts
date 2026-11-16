/**
 * Lesson 02 - exercises. Page: /locators
 *
 * For each exercise, write the SAME check twice where it says so - once with
 * a built-in locator and once with CSS or XPath - and decide which one you
 * would keep in a real project. Change test.fixme( to test( when you start.
 */
import { expect, test } from '../../fixtures/site';

test.beforeEach(async ({ page }) => {
  await page.goto('/locators');
});

test.fixme('exercise 1: the "From account" dropdown', async ({ page }) => {
  // Assert it has the value "current". Once with getByLabel, once with CSS.
  void page;
  void expect;
});

test.fixme('exercise 2: the IBAN of Maria Lungu', async ({ page }) => {
  // Assert it is RO66BACX0000001234567890.
  // Once with getByRole('row').filter(...), once with an XPath axis.
  void page;
});

test.fixme('exercise 3: the nav link to Actions', async ({ page }) => {
  // There are two navigations to /actions on some pages - scope the locator
  // to the nav named "Main" and assert its href.
  // Hint: page.getByRole('navigation', { name: 'Main' }).getByRole(...)
  void page;
});

test.fixme('exercise 4: the strict-mode error', async ({ page }) => {
  // Click page.getByRole('button', { name: 'Delete' }) without narrowing it,
  // run the test, and copy the first line of the error into this comment.
  // Then fix the locator so it clicks Ana Pop's button.
  void page;
});
