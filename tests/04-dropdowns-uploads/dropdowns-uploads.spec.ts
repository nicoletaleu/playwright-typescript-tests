/**
 * Lesson 04 - dropdowns and uploads.
 *
 * A dropdown is one of three things, and each is driven differently:
 * - a native <select>: `selectOption`, one call, no clicking - the browser
 *   draws its list outside the page, so there is nothing to click anyway;
 * - a custom dropdown (a button and a role="listbox"): click it open, click
 *   the option, exactly as a user does. `selectOption` refuses it;
 * - a searchable dropdown (a combobox): type, wait for the options, pick one.
 *
 * An upload is `setInputFiles` on the <input type="file">. It sets the files
 * directly, without the operating system's dialog, which Playwright cannot
 * reach.
 *
 * Pages: /dropdowns and /upload. Each prints what it received, so the tests
 * assert on the effect, as in lesson 03.
 *
 * Run only this lesson:  npx playwright test tests/04-dropdowns-uploads
 */
import path from 'node:path';
import { expect, test } from '../../fixtures/site';

// Relative to this file, not to the folder the run was started from:
// setInputFiles resolves a relative path against the current directory.
const STATEMENT = path.join(__dirname, 'files', 'statement.csv');

test.describe('native select', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dropdowns');
  });

  test('selectOption by value, by label, by index', async ({ page }) => {
    const currency = page.getByLabel('Currency');

    // A plain string matches an option's value or its visible label.
    await currency.selectOption('eur');
    await expect(currency).toHaveValue('eur');

    // An object says which one is meant.
    await currency.selectOption({ label: 'Romanian leu (RON)' });
    await expect(currency).toHaveValue('ron');

    // Index counts from 0, and the placeholder "Choose a currency" is 0.
    // Brittle: adding an option moves it. Prefer value or label.
    await currency.selectOption({ index: 2 });
    await expect(currency).toHaveValue('usd');

    // The page's change handler ran, so the selection was a real one.
    await expect(page.locator('#log')).toHaveText('currency: usd');
  });

  test('selectOption returns what ended up selected', async ({ page }) => {
    const selected = await page.getByLabel('Currency').selectOption('British pound (GBP)');
    expect(selected).toEqual(['gbp']);
  });

  test('the selected option, and all the options', async ({ page }) => {
    const currency = page.getByLabel('Currency');
    await currency.selectOption('ron');

    // toHaveValue checks the value; the text the user sees is on the
    // selected <option>, which CSS calls :checked.
    await expect(currency.locator('option:checked')).toHaveText('Romanian leu (RON)');

    // Every option, in order - catches an option that went missing.
    await expect(currency.locator('option')).toHaveText([
      'Choose a currency',
      'Euro (EUR)',
      'US dollar (USD)',
      'Romanian leu (RON)',
      'British pound (GBP)',
    ]);
  });

  test('a multiple select takes an array, and replaces the selection', async ({ page }) => {
    const channels = page.getByLabel('Notify me by');

    await channels.selectOption(['email', 'push']);
    await expect(channels).toHaveValues(['email', 'push']);
    await expect(page.locator('#log')).toHaveText('channels: email, push');

    // Not added to the previous selection: whatever is not listed is deselected.
    await channels.selectOption(['sms']);
    await expect(channels).toHaveValues(['sms']);

    // An empty array clears it.
    await channels.selectOption([]);
    await expect(channels).toHaveValues([]);
  });
});

test.describe('custom dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dropdowns');
  });

  test('open it, then click the option', async ({ page }) => {
    const account = page.getByRole('button', { name: 'From account' });
    const savings = page.getByRole('option', { name: 'Savings account' });

    // getByRole skips hidden elements, so while the list is closed the option
    // is not found at all - it has to be opened first, like a user would.
    await expect(savings).toBeHidden();
    await account.click();
    await expect(account).toHaveAttribute('aria-expanded', 'true');

    await savings.click();
    await expect(account).toHaveText('Savings account');
    await expect(account).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#log')).toHaveText('account: Savings account');
  });

  test('the options, read through the listbox', async ({ page }) => {
    await page.getByRole('button', { name: 'From account' }).click();
    const options = page.getByRole('listbox', { name: 'Accounts' }).getByRole('option');
    await expect(options).toHaveText(['Current account', 'Savings account', 'Joint account (blocked)']);
  });

  test('aria-disabled counts as disabled', async ({ page }) => {
    await page.getByRole('button', { name: 'From account' }).click();
    // Playwright reads aria-disabled="true" the way a screen reader does, so
    // a click on this option would wait for it to be enabled and time out.
    await expect(page.getByRole('option', { name: 'Joint account (blocked)' })).toBeDisabled();
  });
});

test.describe('searchable dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dropdowns');
  });

  test('type, wait for the options, pick one', async ({ page }) => {
    const beneficiary = page.getByRole('combobox', { name: 'Beneficiary' });

    // fill works here: the page listens to 'input', which fill fires. If it
    // listened to keydown, this would need pressSequentially (lesson 03).
    await beneficiary.fill('pop');

    // The options arrive 300 ms later. No sleep: toHaveCount retries until
    // the list has two, and click() waits for its option to exist.
    // Scoped to the listbox, because page.getByRole('option') also finds every
    // <option> of the two native selects above - they have the same role.
    const options = page.getByRole('listbox', { name: 'Beneficiaries' }).getByRole('option');
    await expect(options).toHaveCount(2);
    await options.filter({ hasText: 'Mihai Popa' }).click();

    await expect(beneficiary).toHaveValue('Mihai Popa');
    await expect(page.locator('#log')).toHaveText('beneficiary: Mihai Popa');
  });

  test('the keyboard way: arrows and Enter', async ({ page }) => {
    const beneficiary = page.getByRole('combobox', { name: 'Beneficiary' });
    const list = page.getByRole('listbox', { name: 'Beneficiaries' });
    await beneficiary.fill('ion');

    // Wait for the list before pressing keys: an ArrowDown sent before the
    // options exist has nothing to move to, and is lost.
    // Matching is case-insensitive, so "Ionescu" counts.
    await expect(list.getByRole('option')).toHaveText(['Ion Rusu', 'Maria Ionescu']);

    await beneficiary.press('ArrowDown');
    await beneficiary.press('ArrowDown');
    await expect(list.getByRole('option', { name: 'Maria Ionescu' })).toHaveAttribute('aria-selected', 'true');
    await beneficiary.press('Enter');

    await expect(beneficiary).toHaveValue('Maria Ionescu');
  });

  test('no match is a state worth a test', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Beneficiary' }).fill('zzz');
    await expect(page.getByText('No matches')).toBeVisible();
    // The combobox says the list is closed, and the list is not shown.
    await expect(page.getByRole('combobox', { name: 'Beneficiary' })).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#beneficiary-list')).toBeHidden();
  });
});

test.describe('uploads', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/upload');
  });

  test('setInputFiles with a file from the repo', async ({ page }) => {
    await page.getByLabel('Bank statement').setInputFiles(STATEMENT);
    // The page read the file: three rows under the header.
    await expect(page.locator('#statement-result')).toHaveText('statement.csv: 3 transactions');
  });

  test('a file made in memory, no file on disk', async ({ page }) => {
    // name + mimeType + buffer: good for one-off content and for file types
    // you do not want to keep in the repo.
    await page.getByLabel('Bank statement').setInputFiles({
      name: 'november.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('date,description,amount\n2026-11-10,Coffee,-12.50\n'),
    });
    await expect(page.locator('#statement-result')).toHaveText('november.csv: 1 transaction');
  });

  test('accept="..." does not stop setInputFiles - the page has to', async ({ page }) => {
    // accept only filters the OS dialog, which setInputFiles never opens. So a
    // .txt goes in, and the page's own validation is what is under test.
    await page.getByLabel('Bank statement').setInputFiles({
      name: 'notes.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('not a statement'),
    });
    await expect(page.getByRole('alert')).toHaveText('notes.txt: only .csv and .pdf files are accepted');
  });

  test('several files at once, and clearing them', async ({ page }) => {
    const receipts = page.getByLabel('Receipts');
    const list = page.getByRole('list', { name: 'Files received' }).getByRole('listitem');

    // An array works only on <input multiple>; on a single input it throws.
    // All paths or all in-memory files - the types do not allow a mix.
    await receipts.setInputFiles([
      { name: 'taxi.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') },
      { name: 'lunch.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') },
    ]);
    await expect(list).toHaveText(['taxi.pdf', 'lunch.pdf']);

    // An empty array removes every file.
    await receipts.setInputFiles([]);
    await expect(list).toHaveCount(0);
  });

  test('a hidden input can be set directly', async ({ page }) => {
    // setInputFiles has no visibility check: the hidden input behind
    // "Upload a profile photo" is set like a visible one.
    await page.locator('#photo').setInputFiles({
      name: 'me.png',
      mimeType: 'image/png',
      buffer: Buffer.from('fake png bytes'),
    });
    await expect(page.locator('#photo-result')).toHaveText('photo: me.png');
  });
});
