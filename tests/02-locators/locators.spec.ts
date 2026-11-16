/**
 * Lesson 02 - locators.
 *
 * A locator is a recipe for finding elements, not an element. It is lazy:
 * nothing is searched until an action or assertion uses it, and it is
 * searched again every time, so it never goes stale the way a Selenium
 * WebElement does.
 *
 * Priority, from most to least preferred:
 *   getByRole > getByLabel > getByPlaceholder > getByText > getByTestId > CSS > XPath
 * The first five describe what a user sees; CSS and XPath describe how the
 * page happens to be built, so they break when the markup changes.
 *
 * Run only this lesson:  npx playwright test tests/02-locators
 */
import { expect, test } from '../../fixtures/site';

test.beforeEach(async ({ page }) => {
  await page.goto('/locators');
});

test.describe('built-in locators', () => {
  test('getByRole finds elements the way a screen reader does', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Transfer money' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Login' })).toHaveAttribute('href', '/login');
    await expect(page.getByRole('button', { name: 'Transfer' })).toBeEnabled();
    // Accessibility state is part of the role: a disabled button is still a button.
    await expect(page.getByRole('button', { name: 'Schedule for later' })).toBeDisabled();
    await expect(page.getByRole('img', { name: 'Bank logo' })).toBeAttached();
  });

  test('getByLabel finds form fields through their <label>', async ({ page }) => {
    await page.getByLabel('Amount').fill('250');
    await expect(page.getByLabel('Amount')).toHaveValue('250');
    // Works for a label that wraps its input, too.
    await page.getByLabel('Save beneficiary for future').check();
    await expect(page.getByLabel('Save beneficiary for future')).toBeChecked();
  });

  test('getByPlaceholder is for inputs without a label', async ({ page }) => {
    await page.getByPlaceholder('What is it for?').fill('Rent');
    await expect(page.getByLabel('Reference')).toHaveValue('Rent');
  });

  test('getByText matches substrings unless told to be exact', async ({ page }) => {
    // "Save" appears in a sentence, in a <span> and on a button.
    await expect(page.getByText('Save', { exact: true })).toHaveCount(2);
    await expect(page.getByText('Changes are saved automatically')).toBeVisible();
  });

  test('getByTestId uses data-testid, made for tests', async ({ page }) => {
    await expect(page.getByTestId('transfer-submit')).toHaveText('Transfer');
  });
});

test.describe('CSS and XPath', () => {
  test('CSS: id, class, attribute, combinators and pseudo-classes', async ({ page }) => {
    await expect(page.locator('#amount')).toHaveAttribute('type', 'number');
    await expect(page.locator('.btn.btn-primary')).toHaveText('Transfer');
    await expect(page.locator('input[name="reference"]')).toBeVisible();
    // Attribute starts with (^=) / ends with ($=).
    await expect(page.locator('[data-testid^="row-"]')).toHaveCount(3);
    // Descendant (space) vs direct child (>).
    await expect(page.locator('#settings > ul > li')).toHaveCount(3);
    await expect(page.locator('.menu-item.active')).toHaveText('Security');
    await expect(page.locator('tbody tr:nth-child(2) td:first-child')).toHaveText('Ion Rusu');
    await expect(page.locator('tbody button:not([disabled])')).toHaveCount(2);
  });

  test('XPath: relative paths only, never absolute', async ({ page }) => {
    // Absolute (/html/body/section[2]/...) breaks on any layout change. Relative
    // paths start with //. Playwright treats a selector starting with // as XPath.
    await expect(page.locator('//input[@id="amount"]')).toBeVisible();
    await expect(page.locator('//button[text()="Transfer"]')).toBeEnabled();
    await expect(page.locator('//td[contains(text(), "Maria")]')).toHaveText('Maria Lungu');
  });

  test('XPath axes walk the DOM from an element you can find', async ({ page }) => {
    // following-sibling: the IBAN cell next to a name.
    await expect(page.locator('//td[text()="Ana Pop"]/following-sibling::td[1]')).toHaveText(
      'RO49AAAA1B31007593840000',
    );
    // ancestor: the row that contains a name, then its button.
    await expect(page.locator('//td[text()="Maria Lungu"]/ancestor::tr//button')).toBeDisabled();
    // parent and preceding-sibling.
    await expect(page.locator('//td[text()="SEPA"]/parent::tr')).toHaveCount(2);
    await expect(page.locator('//td[text()="Instant"]/preceding-sibling::td[2]')).toHaveText('Ion Rusu');
  });
});

test.describe('narrowing down', () => {
  test('three "Delete" buttons: make the locator specific', async ({ page }) => {
    const deleteButtons = page.getByRole('button', { name: 'Delete' });
    // Using it as-is would fail with a strict-mode error: Playwright refuses to
    // click "one of three" and guess which.
    await expect(deleteButtons).toHaveCount(3);

    // filter({ hasText }) - the row that mentions a name, then the button in it.
    const ionsRow = page.getByRole('row').filter({ hasText: 'Ion Rusu' });
    await expect(ionsRow.getByRole('button', { name: 'Delete' })).toBeEnabled();

    // filter({ has }) - rows that contain a disabled button.
    const lockedRows = page.getByRole('row').filter({ has: page.locator('button[disabled]') });
    await expect(lockedRows).toHaveCount(1);
    await expect(lockedRows).toContainText('Maria Lungu');

    // nth / first / last - by position. Last resort: order is not meaning.
    await expect(deleteButtons.last()).toBeDisabled();
  });

  test('chaining scopes one locator inside another', async ({ page }) => {
    const settings = page.locator('#settings');
    await expect(settings.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(settings.getByRole('listitem')).toHaveText(['Profile', 'Security', 'Notifications']);
  });
});
