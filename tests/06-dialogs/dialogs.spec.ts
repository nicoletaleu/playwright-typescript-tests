/**
 * Port of the dialog half of tests/web/14_alerts_frames_windows.robot.
 *
 * The idea is the same in both tools: a JavaScript dialog blocks the page, so
 * you say how to answer it before the click that opens it. Robot has two
 * spellings for that (Handle Future Dialogs for a standing rule, Promise To +
 * Wait For Alert for one dialog). Playwright has one: an event handler.
 * `page.once('dialog', ...)` answers exactly one dialog, and the handler gets
 * the dialog object, so its message can be asserted in the same place.
 *
 * Playwright's own default, with no handler at all, is to dismiss every
 * dialog. That makes a forgotten handler quiet instead of a hang - which is
 * why the confirm test asserts both answers: a test that only checked "Ok"
 * would pass for the wrong reason the day the handler disappeared.
 */
import { expect, test } from '../../fixtures/site';

test.describe('JavaScript dialogs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/javascript_alerts');
  });

  test('accept a simple alert', { tag: '@smoke' }, async ({ page }) => {
    let message = '';
    page.once('dialog', async (dialog) => {
      message = dialog.message();
      await dialog.accept();
    });
    await page.getByRole('button', { name: 'Click for JS Alert' }).click();
    await expect(page.locator('#result')).toHaveText('You successfully clicked an alert');
    expect(message).toBe('I am a JS Alert');
  });

  test('accept or dismiss a confirm box', async ({ page }) => {
    const confirmButton = page.getByRole('button', { name: 'Click for JS Confirm' });
    const result = page.locator('#result');

    page.once('dialog', (dialog) => dialog.accept());
    await confirmButton.click();
    await expect(result).toHaveText('You clicked: Ok');

    page.once('dialog', (dialog) => dialog.dismiss());
    await confirmButton.click();
    await expect(result).toHaveText('You clicked: Cancel');
  });

  test('type into a prompt', async ({ page }) => {
    let question = '';
    page.once('dialog', async (dialog) => {
      question = dialog.message();
      await dialog.accept('Playwright');
    });
    await page.getByRole('button', { name: 'Click for JS Prompt' }).click();
    await expect(page.locator('#result')).toHaveText('You entered: Playwright');
    expect(question).toBe('I am a JS prompt');
  });
});
