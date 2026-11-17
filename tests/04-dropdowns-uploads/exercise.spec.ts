/**
 * Lesson 04 - exercises, solved. Pages: /dropdowns and /upload
 *
 * To redo one from scratch, change its `test(` back to `test.fixme(` and
 * delete the body.
 */
import path from 'node:path';
import { expect, test } from '../../fixtures/site';

test('exercise 1: a native select, two ways', async ({ page }) => {
  await page.goto('/dropdowns');

  const currency = page.getByLabel('Currency');
  await currency.selectOption({ label: 'British pound (GBP)' });
  await expect(currency).toHaveValue('gbp');
  await expect(page.locator('#log')).toHaveText('currency: gbp');

  // One call for both: an array selects all of them at once.
  const channels = page.getByLabel('Notify me by');
  await channels.selectOption(['email', 'sms']);
  await expect(channels).toHaveValues(['email', 'sms']);
});

test('exercise 2: selectOption on a custom dropdown', async ({ page }) => {
  await page.goto('/dropdowns');
  const account = page.getByRole('button', { name: 'From account' });

  // a) It fails, and not with a timeout - the error comes at once:
  //      locator.selectOption: Error: Element is not a <select> element
  //    Waiting cannot turn a <button> into a <select>, so Playwright does not
  //    retry. The fix is to drive it the way a user does, below.
  await expect(account.selectOption('Current account', { timeout: 2000 })).rejects.toThrow(
    'Element is not a <select> element',
  );

  // b) Open it, click the option.
  await account.click();
  await page.getByRole('listbox', { name: 'Accounts' }).getByRole('option', { name: 'Current account' }).click();
  await expect(account).toHaveText('Current account');
  await expect(account).toHaveAttribute('aria-expanded', 'false');
});

test('exercise 3: search, then pick', async ({ page }) => {
  await page.goto('/dropdowns');
  const beneficiary = page.getByRole('combobox', { name: 'Beneficiary' });

  await beneficiary.fill('an');
  // "an" is a case-insensitive substring: Ana, IoANa, ANdrei.
  await expect(page.getByRole('listbox', { name: 'Beneficiaries' }).getByRole('option')).toHaveText([
    'Ana Pop',
    'Ioana Marin',
    'Andrei Stan',
  ]);

  // Keyboard only. ArrowUp with nothing highlighted goes to the last option.
  await beneficiary.press('ArrowUp');
  await beneficiary.press('Enter');
  await expect(beneficiary).toHaveValue('Andrei Stan');

  // Why the assertion comes first: the page looks the names up 300 ms after
  // the last keystroke. press() does not wait for that - it only waits for the
  // combobox to be ready. An ArrowDown sent before the list exists has no
  // option to move to and is lost, so Enter then picks nothing. toHaveText
  // retries until the options are there, which makes it the wait.
});

test('exercise 4: uploads, the whole page', async ({ page }) => {
  await page.goto('/upload');
  const statement = page.getByLabel('Bank statement');

  // a) From disk. __dirname, because a relative path would resolve against
  //    the folder the run started in, not this file.
  await statement.setInputFiles(path.join(__dirname, 'files', 'statement.csv'));
  await expect(page.locator('#statement-result')).toHaveText('statement.csv: 3 transactions');

  // b) From memory. The page only checks the name for a PDF, so the bytes
  //    can be anything.
  await statement.setInputFiles({
    name: 'statement.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4'),
  });
  await expect(page.locator('#statement-result')).toHaveText('statement.pdf: received');

  // c) Three receipts, then none.
  const receipts = page.getByLabel('Receipts');
  const list = page.getByRole('list', { name: 'Files received' }).getByRole('listitem');
  const names = ['taxi.pdf', 'lunch.pdf', 'hotel.pdf'];

  await receipts.setInputFiles(
    names.map((name) => ({ name, mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') })),
  );
  await expect(list).toHaveText(names);

  await receipts.setInputFiles([]);
  await expect(list).toHaveCount(0);
});

test('exercise 5: the file chooser', async ({ page }) => {
  await page.goto('/upload');

  // Start waiting first, without await, so the listener exists when the
  // click opens the chooser.
  const chooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Upload a profile photo' }).click();
  const chooser = await chooserPromise;
  await chooser.setFiles({ name: 'me.png', mimeType: 'image/png', buffer: Buffer.from('fake png bytes') });

  await expect(page.locator('#photo-result')).toHaveText('photo: me.png');

  // Waiting after the click instead: the event has already fired, nobody was
  // listening, and the wait runs out on an event that will not come again:
  //   page.waitForEvent: Timeout 2000ms exceeded while waiting for event "filechooser"
  // (run with { timeout: 2000 }; the default would wait the whole test timeout).
});
