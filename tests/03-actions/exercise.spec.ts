/**
 * Lesson 03 - exercises. Page: /actions
 * Change test.fixme( to test( when you start.
 */
import { expect, test } from '../../fixtures/site';

test.beforeEach(async ({ page }) => {
  await page.goto('/actions');
});

test.fixme('exercise 1: a whole form, start to finish', async ({ page }) => {
  // Fill "Full name", write a comment, accept the terms, uncheck the
  // newsletter and choose SEPA. Then assert all five states.
  void page;
  void expect;
});

test.fixme('exercise 2: count the keystrokes', async ({ page }) => {
  // Type "salary" into Search with pressSequentially and assert the counter
  // shows 6. Then press Backspace twice with press() and assert it shows 8.
  void page;
});

test.fixme('exercise 3: what force skips', async ({ page }) => {
  // On /locators, the "Schedule for later" button is disabled.
  // a) click it normally with a short timeout ({ timeout: 2000 }) and see it fail
  // b) click it with { force: true } and see it "pass"
  // Write in this comment why b) is a test that proves nothing, then delete b).
  void page;
});
