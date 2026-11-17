# Playwright cheat sheet

Grows with each lesson. Everything here is used in a test in this repo.

## Run (lesson 01)

```bash
npx playwright test                         # all tests
npx playwright test tests/02-locators       # one folder
npx playwright test -g "getByRole"          # by title
npx playwright test --headed                # see the browser
npx playwright test --ui                    # UI mode
npx playwright test --debug                 # step through with the inspector
npx playwright show-report                  # last HTML report
```

## A test (lesson 01)

```ts
import { expect, test } from '../../fixtures/site';

test('name', async ({ page }) => {
  await page.goto('/path');                      // relative to baseURL
  await expect(page).toHaveTitle('...');
  await expect(page).toHaveURL(/\/path$/);
  await test.step('a named step', async () => { /* ... */ });
});
```

## Locators (lesson 02)

```ts
page.getByRole('button', { name: 'Transfer' })        // first choice
page.getByRole('button', { name: 'Save', exact: true })
page.getByLabel('Amount')
page.getByPlaceholder('What is it for?')
page.getByText('Save', { exact: true })
page.getByTestId('transfer-submit')                    // data-testid
page.locator('#id .class [name="x"] tr:nth-child(2) button:not([disabled])')
page.locator('//td[text()="Ana Pop"]/following-sibling::td[1]')   // XPath

locator.filter({ hasText: 'Ion' })
locator.filter({ has: page.locator('button[disabled]') })
locator.getByRole('button')                             // chain = scope
locator.first() / .last() / .nth(1)                     // last resort
```

Priority: role > label > placeholder > text > test id > CSS > XPath.
More than one match on an action = strict-mode error: narrow the locator.

## Actions (lesson 03)

```ts
await locator.fill('text');                  // replace, no key events
await locator.pressSequentially('text');     // real keystrokes
await locator.clear();
await locator.press('Enter');
await page.keyboard.press('Control+K');
await locator.check(); await locator.uncheck(); await locator.setChecked(false);
await locator.click();
await locator.click({ button: 'right' });
await locator.click({ modifiers: ['Shift'] });
await locator.dblclick();
await locator.hover();
await locator.focus();
// { force: true } skips actionability checks - avoid
```

## Dropdowns and uploads (lesson 04)

```ts
// native <select>
await select.selectOption('eur');                     // value or label
await select.selectOption({ label: 'Euro (EUR)' });   // also { value }, { index }
await select.selectOption(['email', 'sms']);          // multiple; [] clears
select.locator('option:checked')                      // the selected option

// custom / searchable: like a user, and scope options to their listbox
await page.getByRole('button', { name: 'From account' }).click();
await page.getByRole('listbox', { name: 'Accounts' }).getByRole('option', { name: 'Savings account' }).click();

// uploads
await input.setInputFiles(path.join(__dirname, 'files', 'statement.csv'));
await input.setInputFiles({ name: 'a.csv', mimeType: 'text/csv', buffer: Buffer.from('...') });
await input.setInputFiles([]);                        // remove all
const chooser = page.waitForEvent('filechooser');     // before the click
await button.click();
await (await chooser).setFiles(path);
```

## Assertions used so far

```ts
await expect(locator).toBeVisible() / .toBeHidden() / .toBeAttached()
await expect(locator).toBeEnabled() / .toBeDisabled() / .toBeChecked() / .toBeFocused()
await expect(locator).toHaveText('x') / .toHaveText(['a', 'b']) / .toContainText('x')
await expect(locator).toHaveValue('x') / .toHaveAttribute('href', '/x') / .toHaveCount(3)
await expect(select).toHaveValues(['email', 'sms'])
await expect(locator).not.toBeChecked()
```
