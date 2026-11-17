/**
 * Lesson 03 - exercises, solved. Page: /actions
 */
import { expect, test } from '../../fixtures/site';

test.beforeEach(async ({ page }) => {
  await page.goto('/actions');
});

test('exercise 1: a whole form, start to finish', async ({ page }) => {
  await page.getByLabel('Full name').fill('Nicoleta Leu');
  await page.getByLabel('Comment').fill('Monthly rent');
  await page.getByLabel('Accept terms').check();
  await page.getByLabel('Send newsletter').uncheck();
  await page.getByLabel('SEPA').check();

  await expect(page.getByLabel('Full name')).toHaveValue('Nicoleta Leu');
  await expect(page.getByLabel('Comment')).toHaveValue('Monthly rent');
  await expect(page.getByLabel('Accept terms')).toBeChecked();
  await expect(page.getByLabel('Send newsletter')).not.toBeChecked();
  await expect(page.getByLabel('SEPA')).toBeChecked();
});

test('exercise 2: count the keystrokes', async ({ page }) => {
  const search = page.getByPlaceholder('Search transactions');
  const keystrokes = page.locator('#keystrokes');

  await search.pressSequentially('salary');
  await expect(keystrokes).toHaveText('6');

  // Prediction: 8. Every key press counts, Backspace included - the counter
  // listens to keydown, not to what ends up in the field.
  await search.press('Backspace');
  await search.press('Backspace');
  await expect(keystrokes).toHaveText('8');
  await expect(search).toHaveValue('sala');
});

test('exercise 3: what force skips', async ({ page }) => {
  await page.goto('/locators');
  const disabled = page.getByRole('button', { name: 'Schedule for later' });

  // a) A normal click on a disabled button times out, and the log says why:
  //      TimeoutError: locator.click: Timeout 2000ms exceeded.
  //        - attempting click action
  //            - element is not enabled
  //        - retrying click action ...
  //    That failure is correct: no user can click this button.
  await expect(disabled.click({ timeout: 2000 })).rejects.toThrow(/Timeout 2000ms exceeded/);

  // b) { force: true } "passed". It skips the actionability checks, so the
  //    click is sent to an element no user could press - and the test then
  //    proves nothing about the page. It was deleted, as the exercise asks;
  //    the disabled state is asserted instead.
  await expect(disabled).toBeDisabled();
});
