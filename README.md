# Playwright + TypeScript

[![playwright](https://github.com/nicoletaleu/playwright-typescript-tests/actions/workflows/playwright.yml/badge.svg)](https://github.com/nicoletaleu/playwright-typescript-tests/actions/workflows/playwright.yml)

Three web suites from
[robot-framework-learning](https://github.com/nicoletaleu/robot-framework-learning),
ported to Playwright with TypeScript, against the same local site.

The point is the comparison, not the tests. Same pages, same assertions, same
server behaviour, so every difference below comes from the tool, not from the
thing being tested.

## Built with

- **Playwright Test** 1.64.1, Chromium only
- **TypeScript** 5.9.3, strict mode, type-checked in CI
- **Node.js** 22, `node:http` for the local site - no web framework
- **GitHub Actions** for CI, **dependabot** for updates

## Run it

```bash
npm install
npx playwright install chromium

npm test              # the whole suite, in parallel
npm run test:smoke    # only tests tagged @smoke
npm run typecheck     # TypeScript, without running anything
npm run report        # open the HTML report of the last run
```

Nothing here touches the internet. The site in [`site/pages/`](site/pages/) is
served by [`site/server.ts`](site/server.ts) on a free port, one server per
worker.

## What was ported

| Robot suite | Here | Tests |
|---|---|---|
| `13_page_objects.robot` | [`login.spec.ts`](tests/login.spec.ts) + [`LoginPage.ts`](tests/pages/LoginPage.ts) | 8 |
| `14_alerts_frames_windows.robot` (dialogs) | [`dialogs.spec.ts`](tests/dialogs.spec.ts) | 3 |
| `15_waits_and_flakiness.robot` | [`waits.spec.ts`](tests/waits.spec.ts) | 7 |

Left out on purpose: iframes, tabs and file upload from suite 14. They port
just as directly as the dialogs and would add length, not contrast.

## What changed, and what did not

**Waits mostly disappeared.** The Robot suite is a list of
`Wait For Elements State` calls, one per state. In Playwright `expect(locator)`
retries until it passes, so the assertion is the wait. What is left is picking
the assertion that names the right state - `toBeVisible` against
`toBeAttached` is the same judgement Day 15 was teaching, minus the extra
keyword. The one test that must *not* wait (`the waits in this suite are
load-bearing`) is the only place that reads the DOM directly, with `count()`.

**Page objects became classes.** A Robot page object is a resource file of
variables and keywords. Here it is a class with typed locators, and the editor
catches a misspelt locator before the test runs. A misspelt `${VARIABLE}` in
Robot is a runtime failure.

**Locators changed style.** The Robot suites use CSS ids. These use
`getByLabel` and `getByRole`, which find elements the way a user does. The
flash message has no role or label, so it stays `#flash` - the honest
exception.

**Data-driven tests became a loop.** Robot's `[Template]` is a language
feature. Playwright has no equivalent and does not need one: a `for` loop that
declares one `test()` per row gives each row its own name and its own result.

**Dialogs have one mechanism instead of two.** Robot has `Handle Future
Dialogs` and `Promise To` + `Wait For Alert`. Playwright has an event handler,
`page.once('dialog', ...)`, which also hands back the dialog's message to
assert on.

**Setup moved into fixtures.** Suite Setup and Test Setup became one
worker-scoped fixture ([`tests/fixtures.ts`](tests/fixtures.ts)) that starts
the server and sets `baseURL`. The fresh browser context per test needed no
code: Playwright gives every test its own by default. In Robot that was a
keyword to remember.

**What stayed the same:** the site, the two distinguishable login failures,
port 0, no retries, and the honesty about what a login test against your own
fixture can claim. It does not test authentication - the accepted password is
in [`site/server.ts`](site/server.ts). It tests locators, waits and the page
object.

## CI

[`.github/workflows/playwright.yml`](.github/workflows/playwright.yml) runs on
every push and pull request: type-check first, then the whole suite. The HTML
report and a trace for every failed test are uploaded as the
`playwright-report` artifact, also on a red run.

No retries, in CI or locally. A retry turns a flaky test green and hides it.
