# 02 - Locators

## The idea

A locator describes how to find something; it is searched only when used, and
again every time. If it matches more than one element, an action on it fails
with a **strict-mode error** instead of guessing - the fix is to make the
locator more specific, not to add `.first()`.

## Which one to use

| Locator | Use it for | Example |
|---|---|---|
| `getByRole` | almost everything: buttons, links, headings, rows, checkboxes | `getByRole('button', { name: 'Transfer' })` |
| `getByLabel` | form fields with a `<label>` | `getByLabel('Amount')` |
| `getByPlaceholder` | inputs that only have a placeholder | `getByPlaceholder('What is it for?')` |
| `getByText` | non-interactive text | `getByText('Save', { exact: true })` |
| `getByTestId` | when nothing user-visible is stable | `getByTestId('transfer-submit')` |
| CSS | structure: ids, classes, attributes, `:nth-child`, `:not` | `locator('tbody tr:nth-child(2)')` |
| XPath | walking from one element to another (axes) | `locator('//td[text()="Ana Pop"]/following-sibling::td[1]')` |

Narrowing: `.filter({ hasText })`, `.filter({ has })`, chaining
(`a.getByRole(...)`), and `nth()` / `first()` / `last()` only as a last resort.

## XPath axes in one line each

`parent::` up one · `ancestor::` up any · `child::` down one ·
`descendant::` down any · `following-sibling::` next to it ·
`preceding-sibling::` before it

## In Robot Framework

The Browser library *is* Playwright, so `id=`, `css=`, `text=` and `xpath=`
work the same. What Robot did not have is `getByRole` / `getByLabel` - in the
Robot repo every locator was CSS.

## Interview question

**"getByTestId or getByRole?"** - `getByRole` by default, because it also
checks that the element is reachable by a user. `getByTestId` when the visible
text changes often (translations, A/B tests) and a stable hook is agreed with
the developers.
