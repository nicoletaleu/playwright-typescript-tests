# 04 - Dropdowns and uploads

## The idea

First find out what the dropdown is made of - open DevTools and look.

- **`<select>`** - `selectOption`. The browser draws its list outside the
  page, so there is nothing to click; Playwright sets the selection and fires
  `input` and `change`.
- **Custom** (a button + `role="listbox"`) - click it open, click the option.
  `selectOption` fails on it with `Element is not a <select> element`.
- **Searchable** (`role="combobox"`) - type, wait for the options, pick one.
  The options usually arrive late (a request, a debounce), so assert on them
  before acting on them; never `waitForTimeout`.

An upload is `setInputFiles` on the `<input type="file">`. It does not open
the operating system's dialog - Playwright cannot reach that dialog at all -
so `accept=".csv"` does not stop it, and the input may be hidden.

## The calls

| Call | Notes |
|---|---|
| `selectOption('eur')` | matches value **or** label |
| `selectOption({ label: 'Euro (EUR)' })` / `({ value })` / `({ index: 1 })` | index breaks when an option is added |
| `selectOption(['email', 'sms'])` | multiple select; replaces the selection, `[]` clears it |
| `expect(select).toHaveValue('eur')` / `toHaveValues([...])` | value of the selection |
| `select.locator('option:checked')` | the selected option, for its text |
| `listbox.getByRole('option')` | scope it: native `<option>`s have the same role |
| `setInputFiles(path)` / `([path1, path2])` | from disk; relative paths resolve against the cwd, so use `path.join(__dirname, ...)` |
| `setInputFiles({ name, mimeType, buffer })` | a file made in memory |
| `setInputFiles([])` | removes every file |
| `page.waitForEvent('filechooser')` + `fileChooser.setFiles(...)` | when there is no input you can reach, only a button; start waiting **before** the click |

## In Robot Framework

Browser library: `Select Options By    id=currency    value    eur` (also
`label`, `index`, `text`), `Get Selected Options`, and
`Upload File By Selector    id=statement    ${CURDIR}/files/statement.csv`.
The file chooser is `Promise To Upload File` before the click - the same
"wait first, then act" order as `waitForEvent`. A custom dropdown is two
`Click`s in both tools.

## Interview question

**"How do you test a dropdown that is not a `<select>`?"** - Like a user:
click it open, wait for the option, click it, then assert what the page shows
as chosen. `selectOption` only works on a real `<select>`.

**"How do you upload a file when the input is hidden?"** - `setInputFiles`
on the input anyway: it has no visibility check. If there is no input in the
DOM until the click, `waitForEvent('filechooser')` before the click.
