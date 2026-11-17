# Learning plan

One lesson at a time. A lesson is **done** when its `exercise.spec.ts` runs
with no `test.fixme` left and passes in CI - reading the examples does not
count.

The topics follow a set of Playwright interview notes (18 sessions), plus
three that a QA automation role asks about and the notes skip: page objects,
API testing and cross-browser runs.

## Basics

- [x] **01 - Setup and the first test** - project structure, the config, running and reading the report
- [x] **02 - Locators** - built-in locators and their priority, CSS, XPath and its axes, strict mode, `filter`
- [x] **03 - Actions** - `fill` vs `pressSequentially`, checkboxes, radio, mouse, keyboard, why not `force`
- [x] **04 - Dropdowns and uploads** - native `<select>`, custom and searchable dropdowns, `setInputFiles`
- [ ] **05 - Tables, pagination, date pickers** - reading text and attributes, finding a row, every page of a table, three kinds of date picker

## Browser behaviour

- [ ] **06 - Dialogs** - alert, confirm, prompt
- [ ] **07 - Frames, tabs, popups, contexts** - nested iframes, `waitForEvent('page')`, two users at once
- [ ] **08 - Auto-waiting and timeouts** - what is waited for, `waitForURL` / `waitForLoadState` / `waitForResponse`
- [ ] **09 - Assertions and Codegen** - web-first and soft assertions, `expect.poll`, recording a test
- [ ] **10 - Screenshots, video, Trace Viewer** - and attaching them to the report

## Test design

- [ ] **11 - Flaky tests** - make one on purpose, find the cause, why retries hide it
- [ ] **12 - Hooks, annotations, tags** - `describe`, the four hooks, `skip` / `fixme` / `fail` / `slow`, `--grep`
- [ ] **13 - Parallel execution** - workers, serial mode, sharding
- [ ] **14 - Data-driven tests** - parameterised tests from JSON, CSV and Excel
- [ ] **15 - Storage state** - log in once, reuse the session

## Structure and CI

- [ ] **16 - Page objects and fixtures**
- [ ] **17 - API testing with Playwright** - the `request` fixture
- [ ] **18 - CI and reports** - the workflow, artifacts, sharding in CI
- [ ] **19 - Cross-browser** - Chromium, Firefox, WebKit and a mobile viewport

## A rule kept from the Robot repo

No retries. A retry turns a flaky test green and hides the cause; lesson 11
is about finding it instead.
