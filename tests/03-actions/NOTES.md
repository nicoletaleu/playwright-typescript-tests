# 03 - Actions

## The idea

Before acting, Playwright waits until the element is **attached, visible,
stable, enabled and receives events**. If it never gets there, the action
times out with a message saying which check failed - which is far more useful
than Selenium's "element not interactable".

## The actions

| Action | Notes |
|---|---|
| `fill(text)` | replaces the value in one go, no key events |
| `pressSequentially(text)` | real key events, one per character - for autocomplete, counters, masks |
| `clear()` | empties the field |
| `press('Enter')` | one key on a focused element |
| `page.keyboard.press('Control+K')` | shortcuts on the page |
| `check()` / `uncheck()` | idempotent: checking a checked box does nothing |
| `setChecked(bool)` | the state as a value - good with test data |
| `click()` | `{ button: 'right' }`, `{ modifiers: ['Shift'] }`, `{ position: { x, y } }` |
| `dblclick()` | double click |
| `hover()` / `focus()` | menus and tooltips / keyboard flows |
| `{ force: true }` | skips the actionability checks - avoid; it can click what a user cannot |

## In Robot Framework

`Fill Text`, `Type Text`, `Click`, `Check Checkbox`, `Hover` - the same
Playwright calls underneath, so the behaviour (auto-wait, strictness) is
identical. Only the syntax changes.

## Interview question

**"fill or type?"** - `fill` by default: faster and not flaky. Use
`pressSequentially` only when the page needs real keystrokes. (`type()` is
the old name and is deprecated.)
