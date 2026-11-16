/**
 * Lesson 03 - actions.
 *
 * Before every action Playwright checks that the element is attached,
 * visible, stable (not animating), enabled and not covered by something
 * else, and waits until it is. That check is why `{ force: true }` exists and
 * why it should almost never be used: it skips the check, so the test can
 * click things no user could.
 *
 * Every control on /actions writes what happened into #log, so each test
 * asserts on the effect of the action - not only that it ran.
 *
 * Run only this lesson:  npx playwright test tests/03-actions
 */
import { expect, test } from '../../fixtures/site';

test.beforeEach(async ({ page }) => {
  await page.goto('/actions');
});

test.describe('text input', () => {
  test('fill replaces the value in one go', async ({ page }) => {
    const name = page.getByLabel('Full name');
    await name.fill('Ana Pop');
    await name.fill('Ion Rusu'); // replaces, does not append
    await expect(name).toHaveValue('Ion Rusu');
  });

  test('clear empties a field', async ({ page }) => {
    const comment = page.getByLabel('Comment');
    await comment.fill('first draft');
    await comment.clear();
    await expect(comment).toHaveValue('');
  });

  test('pressSequentially types key by key, fill does not', async ({ page }) => {
    const search = page.getByPlaceholder('Search transactions');
    const keystrokes = page.locator('#keystrokes');

    // fill sets the value directly: no keydown events fire.
    await search.fill('rent');
    await expect(keystrokes).toHaveText('0');

    // pressSequentially sends real key events - use it when the page reacts
    // to typing (autocomplete, character counters, input masks).
    await search.clear();
    await search.pressSequentially('rent');
    await expect(keystrokes).toHaveText('4');
  });

  test('press sends a single key, like Enter', async ({ page }) => {
    const search = page.getByPlaceholder('Search transactions');
    await search.fill('salary');
    await search.press('Enter');
    await expect(page.locator('#log')).toHaveText('searched for: salary');
  });

  test('keyboard shortcuts go through page.keyboard', async ({ page }) => {
    await page.keyboard.press('Control+K');
    await expect(page.locator('#log')).toHaveText('shortcut: focus search');
    await expect(page.getByPlaceholder('Search transactions')).toBeFocused();
  });
});

test.describe('checkboxes and radio buttons', () => {
  test('check and uncheck are idempotent', async ({ page }) => {
    const terms = page.getByLabel('Accept terms');
    const newsletter = page.getByLabel('Send newsletter');

    await terms.check();
    await terms.check(); // already checked: nothing happens, no toggle back
    await expect(terms).toBeChecked();

    await newsletter.uncheck();
    await expect(newsletter).not.toBeChecked();
  });

  test('setChecked takes the state as data', async ({ page }) => {
    // Handy in data-driven tests, where the wanted state is a variable.
    const wanted = false;
    await page.getByLabel('Send newsletter').setChecked(wanted);
    await expect(page.getByLabel('Send newsletter')).not.toBeChecked();
  });

  test('a radio button is checked, never unchecked', async ({ page }) => {
    await page.getByLabel('Instant').check();
    await expect(page.getByLabel('Instant')).toBeChecked();
    await expect(page.locator('#log')).toHaveText('type: instant');

    // Choosing another one is the only way to uncheck it.
    await page.getByLabel('SWIFT').check();
    await expect(page.getByLabel('Instant')).not.toBeChecked();
  });
});

test.describe('mouse', () => {
  test('click', async ({ page }) => {
    // exact: true - by default the name is a case-insensitive substring, and
    // "Click me" is inside "Double-click me", "Right-click me" and
    // "Shift-click me" too. Without it this is a strict-mode error.
    await page.getByRole('button', { name: 'Click me', exact: true }).click();
    await expect(page.locator('#log')).toHaveText('clicked');
  });

  test('double click', async ({ page }) => {
    await page.getByRole('button', { name: 'Double-click me' }).dblclick();
    await expect(page.locator('#log')).toHaveText('double-clicked');
  });

  test('right click', async ({ page }) => {
    await page.getByRole('button', { name: 'Right-click me' }).click({ button: 'right' });
    await expect(page.locator('#log')).toHaveText('right-clicked');
  });

  test('click with a modifier key', async ({ page }) => {
    await page.getByRole('button', { name: 'Shift-click me' }).click({ modifiers: ['Shift'] });
    await expect(page.locator('#log')).toHaveText('shift-clicked');
  });

  test('hover reveals what only appears under the mouse', async ({ page }) => {
    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toBeHidden();
    await page.getByText('Hover over me').hover();
    await expect(tooltip).toHaveText('Helpful tooltip');
  });

  test('focus', async ({ page }) => {
    await page.getByLabel('Comment').focus();
    await expect(page.getByLabel('Comment')).toBeFocused();
  });
});
