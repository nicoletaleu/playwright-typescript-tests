# 01 - Setup and the first test

## The idea

A Playwright test is an `async` function that gets fixtures (`page`,
`context`, `browser`, `request`...) and drives them with `await`. The runner,
the assertions and the browsers all come from one package, `@playwright/test`.

## The project, file by file

| File | What it is for |
|---|---|
| `package.json` | the pinned versions and the npm scripts (`npm test`, `npm run typecheck`) |
| `playwright.config.ts` | where tests live, reporters, traces, screenshots, browser projects |
| `tsconfig.json` | type-checking only - Playwright runs `.ts` files itself, no build step |
| `fixtures/site.ts` | starts the local site per worker and sets `baseURL` |
| `pages/` | page objects (lesson 16) |
| `site/` | the pages the tests drive, and the server for them |
| `tests/NN-topic/` | one folder per lesson |

## Commands

```bash
npx playwright test                         # everything
npx playwright test tests/01-first-test     # one folder
npx playwright test -g "home page"          # tests whose title matches
npx playwright test --headed                # watch the browser
npx playwright test --ui                    # UI mode: run, watch, time-travel
npx playwright show-report                  # the HTML report of the last run
```

## In Robot Framework

`*** Test Cases ***` plus `Suite Setup` / `Test Setup`. Here the setup is a
fixture, and a fresh browser context per test is the default rather than
something to remember.

## Interview question

**"Why does Playwright not need explicit waits like Selenium?"** - Actions
wait for the element to be actionable (attached, visible, stable, enabled,
receiving events) and `expect` retries until the assertion holds. The
assertion is the wait.
