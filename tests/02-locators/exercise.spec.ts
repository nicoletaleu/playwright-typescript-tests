/**
 * Lesson 02 - exercises, solved. Page: /locators
 *
 * Where an exercise asks for the same check twice, both versions are kept,
 * with the one worth keeping in a real project marked.
 */
import { expect, test } from '../../fixtures/site';

test.beforeEach(async ({ page }) => {
  await page.goto('/locators');
});

test('exercise 1: the "From account" dropdown', async ({ page }) => {
  // Keep: reads like the page, survives an id rename.
  await expect(page.getByLabel('From account')).toHaveValue('current');
  // CSS: shorter, but tied to an id the user never sees.
  await expect(page.locator('select#from-account')).toHaveValue('current');
});

test('exercise 2: the IBAN of Maria Lungu', async ({ page }) => {
  const iban = 'RO66BACX0000001234567890';

  // Keep: find the row by what it says, then the cell by its position in it.
  const mariasRow = page.getByRole('row').filter({ hasText: 'Maria Lungu' });
  await expect(mariasRow.getByRole('cell').nth(1)).toHaveText(iban);

  // XPath axis: works, but breaks if the name cell ever gets wrapped in a <span>.
  await expect(page.locator('//td[text()="Maria Lungu"]/following-sibling::td[1]')).toHaveText(iban);
});

test('exercise 3: the nav link to Actions', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Main' });
  await expect(nav.getByRole('link', { name: 'Actions' })).toHaveAttribute('href', '/actions');
});

test('exercise 4: the strict-mode error', async ({ page }) => {
  // Unnarrowed version: page.getByRole('button', { name: 'Delete' }).click()
  // First line of the error:
  //   Error: locator.click: Error: strict mode violation:
  //   getByRole('button', { name: 'Delete' }) resolved to 3 elements:
  // followed by the three matches. Playwright refuses to guess which one.
  const anasRow = page.getByRole('row').filter({ hasText: 'Ana Pop' });
  const deleteAna = anasRow.getByRole('button', { name: 'Delete' });
  await expect(deleteAna).toHaveCount(1);
  await deleteAna.click();
});
