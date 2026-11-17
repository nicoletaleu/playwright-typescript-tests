/**
 * Lesson 04 - exercises. Pages: /dropdowns and /upload
 * Change test.fixme( to test( when you start.
 */
import { expect, test } from '../../fixtures/site';

test.fixme('exercise 1: a native select, two ways', async ({ page }) => {
  // On /dropdowns, choose "British pound (GBP)" in Currency by its label and
  // assert the value is "gbp" and #log says "currency: gbp".
  // Then, in "Notify me by", choose Email and SMS in one call and assert
  // both with toHaveValues.
  void page;
  void expect;
});

test.fixme('exercise 2: selectOption on a custom dropdown', async ({ page }) => {
  // On /dropdowns:
  // a) call selectOption('Current account') on the "From account" button with
  //    { timeout: 2000 } and see it fail. Write the error in this comment.
  // b) choose "Current account" the way a user does, and assert the button's
  //    text and that aria-expanded is back to "false".
  void page;
});

test.fixme('exercise 3: search, then pick', async ({ page }) => {
  // On /dropdowns, type "an" into Beneficiary. Assert the exact list of
  // options that appears (all of them, in order), then pick "Andrei Stan"
  // with the keyboard only and assert the combobox's value.
  // Write in this comment why an assertion on the options has to come before
  // the first ArrowDown.
  void page;
});

test.fixme('exercise 4: uploads, the whole page', async ({ page }) => {
  // On /upload:
  // a) upload tests/04-dropdowns-uploads/files/statement.csv to "Bank statement"
  //    and assert the result line. Build the path with path.join(__dirname, ...).
  // b) upload a file named "statement.pdf" made in memory (a Buffer) to the
  //    same input and assert "statement.pdf: received".
  // c) upload three receipts from memory to "Receipts", assert all three
  //    names, then clear the input and assert the list is empty.
  void page;
});

test.fixme('exercise 5: the file chooser', async ({ page }) => {
  // On /upload, upload "me.png" through the "Upload a profile photo" button,
  // not through the hidden input:
  //   start waiting with page.waitForEvent('filechooser') BEFORE the click,
  //   click the button, then call setFiles on the file chooser.
  // Assert #photo-result. Write in this comment what goes wrong if the wait
  // starts after the click.
  void page;
});
