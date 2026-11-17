# Playwright + TypeScript

[![playwright](https://github.com/nicoletaleu/playwright-typescript-tests/actions/workflows/playwright.yml/badge.svg)](https://github.com/nicoletaleu/playwright-typescript-tests/actions/workflows/playwright.yml)

A Playwright course, one lesson at a time, from the first test to CI - and a
comparison with Robot Framework along the way. Everything runs against a local
site served from this repo, so nothing depends on the internet.

## How the course works

Every lesson is a folder in [`tests/`](tests/) with three files:

- **`*.spec.ts`** - worked examples: real, passing tests, commented with *why*.
- **`exercise.spec.ts`** - exercises marked `test.fixme()`. Change it to
  `test()`, write the body, make it pass. CI runs them once they are enabled.
- **`NOTES.md`** - the concept in short, the Robot Framework equivalent, and
  the interview question it answers.

A lesson is done when its exercises pass, not when its examples do. Progress
is tracked in [`LEARNING-PLAN.md`](LEARNING-PLAN.md); every command and API on
one page is in [`CHEATSHEET.md`](CHEATSHEET.md).

## Lessons

| # | Lesson | Status |
|---|---|---|
| 01 | [Setup and the first test](tests/01-first-test/) | done |
| 02 | [Locators: built-in, CSS, XPath and axes](tests/02-locators/) | done |
| 03 | [Actions: text, checkboxes, radio, mouse, keyboard](tests/03-actions/) | done |
| 04 | [Dropdowns and uploads](tests/04-dropdowns-uploads/) | done |
| 05 | Tables, pagination, date pickers | planned |
| 06 | [Dialogs](tests/06-dialogs/) | examples (from the Robot port) |
| 07 | Frames, tabs, popups, contexts | planned |
| 08 | [Auto-waiting and timeouts](tests/08-waits/) | examples (from the Robot port) |
| 09 | Assertions and Codegen | planned |
| 10 | Screenshots, video, Trace Viewer | planned |
| 11 | Flaky tests | planned |
| 12 | Hooks, annotations, tags | planned |
| 13 | Parallel execution and sharding | planned |
| 14 | Data-driven tests: JSON, CSV, Excel | planned |
| 15 | Storage state | planned |
| 16 | [Page objects and fixtures](tests/16-page-objects/) | examples (from the Robot port) |
| 17 | API testing with Playwright | planned |
| 18 | CI and reports | planned |
| 19 | Cross-browser | planned |

## Built with

- **Playwright Test** 1.65.1, Chromium (cross-browser comes in lesson 19)
- **TypeScript** 7.0.2, strict mode, type-checked in CI
- **Node.js** 22, `node:http` for the local site - no web framework
- **GitHub Actions** for CI, **dependabot** for updates

## Run it

```bash
npm install
npx playwright install chromium

npm test                                  # everything, in parallel
npx playwright test tests/02-locators     # one lesson
npm run test:smoke                        # only tests tagged @smoke
npm run typecheck                         # TypeScript, without running anything
npm run report                            # the HTML report of the last run
```

The site in [`site/pages/`](site/pages/) is served by
[`site/server.ts`](site/server.ts) on a free port, one server per worker.

## Project structure

```
fixtures/site.ts     starts the local site per worker, sets baseURL
pages/               page objects
site/                the pages under test and their server
tests/NN-topic/      one folder per lesson
```

## Robot Framework comparison

Lessons 06, 08 and 16 began as a port of three suites from
[robot-framework-learning](https://github.com/nicoletaleu/robot-framework-learning),
against the same local site, so every difference comes from the tool:

| Robot suite | Here |
|---|---|
| `13_page_objects.robot` | [lesson 16](tests/16-page-objects/) + [`LoginPage.ts`](pages/LoginPage.ts) |
| `14_alerts_frames_windows.robot` (dialogs) | [lesson 06](tests/06-dialogs/) |
| `15_waits_and_flakiness.robot` | [lesson 08](tests/08-waits/) |

### What changed, and what did not

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
worker-scoped fixture ([`fixtures/site.ts`](fixtures/site.ts)) that starts
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
