/**
 * Port of tests/web/15_waits_and_flakiness.robot.
 *
 * This is the suite where the two tools differ most, and it is mostly a
 * deletion. Robot's version is a list of Wait For Elements State calls, one per
 * state. In Playwright almost all of them disappear: `expect(locator)` retries
 * until the assertion holds or the timeout runs out, so the assertion *is* the
 * wait. What is left is choosing the assertion that names the right state -
 * toBeVisible, toBeAttached, toBeEnabled, toHaveCount(0) - which is the same
 * judgement the Robot suite was teaching, without the separate wait keyword.
 *
 * The first test is kept exactly, because it is what makes the rest worth
 * running: right after the click, the element must NOT be there yet. If it
 * ever is, the pages have become too fast and every test below passes
 * without waiting for anything.
 */
import { expect, test } from './fixtures';

test.describe('waits', () => {
  test('the waits in this suite are load-bearing', async ({ page }) => {
    await page.goto('/dynamic_loading/2');
    await page.getByRole('button', { name: 'Start' }).click();
    // locator.count() does not retry - it reads the DOM as it is right now,
    // which is the one place in this file where not waiting is the point.
    expect(
      await page.locator('#finish').count(),
      '#finish was already there - the page answers too fast for this suite to prove anything',
    ).toBe(0);
  });

  test('auto-waiting handles the happy path', { tag: '@smoke' }, async ({ page }) => {
    await page.goto('/dynamic_loading/2');
    await page.getByRole('button', { name: 'Start' }).click();
    // No wait call: toHaveText retries until #finish exists and says this.
    await expect(page.locator('#finish')).toHaveText('Hello World!');
  });

  test('wait for an element to become visible', async ({ page }) => {
    // On this page #finish is in the DOM from the start, only hidden - so
    // toBeAttached would pass immediately and prove nothing.
    await page.goto('/dynamic_loading/1');
    await page.getByRole('button', { name: 'Start' }).click();
    await expect(page.locator('#finish')).toBeVisible();
    await expect(page.locator('#finish')).toHaveText('Hello World!');
  });

  test('wait for an element to be added to the DOM', async ({ page }) => {
    await page.goto('/dynamic_loading/2');
    await page.getByRole('button', { name: 'Start' }).click();
    await expect(page.locator('#finish')).toBeAttached();
  });

  test('wait for a control to become enabled', async ({ page }) => {
    await page.goto('/dynamic_controls');
    const field = page.locator('#input-example input');
    await page.locator('#input-example').getByRole('button', { name: 'Enable' }).click();
    await expect(field).toBeEnabled();
    // Typing is what proves the wait ended at the right moment.
    await field.fill('now I can type');
    await expect(page.locator('#message')).toHaveText("It's enabled!");
  });

  test('wait for an element to disappear', async ({ page }) => {
    await page.goto('/dynamic_controls');
    await page.locator('#checkbox-example').getByRole('button', { name: 'Remove' }).click();
    // toHaveCount(0) = gone from the DOM; toBeHidden would also accept "still
    // there but invisible", which is a different claim.
    await expect(page.locator('#checkbox')).toHaveCount(0);
    await expect(page.locator('#message')).toHaveText("It's gone!");
  });

  test('a longer timeout for one slow assertion', async ({ page }) => {
    // Robot set this once per test with Set Browser Timeout. Here it is per
    // assertion, which keeps a generous timeout from leaking into checks that
    // should fail fast.
    await page.goto('/dynamic_loading/1');
    await page.getByRole('button', { name: 'Start' }).click();
    await expect(page.locator('#finish')).toBeVisible({ timeout: 15_000 });
  });
});
