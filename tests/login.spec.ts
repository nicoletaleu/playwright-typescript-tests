/**
 * Port of tests/web/13_page_objects.robot.
 *
 * Every test is written in page-object methods; there is no selector in this
 * file. The data-driven case is the one that changed shape most: Robot has
 * [Template], Playwright has a plain loop that declares one test per row. Each
 * row is still its own test with its own name in the report, which is the
 * property that mattered - a failing row does not hide the ones after it.
 */
import { expect, test } from './fixtures';
import { LoginPage, VALID_PASSWORD, VALID_USER } from './pages/LoginPage';

test.describe('login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
  });

  test('a user can log in and log out', { tag: '@smoke' }, async () => {
    await loginPage.open();
    await loginPage.loginWithValidCredentials();
    await loginPage.expectLoggedIn();
    await loginPage.logout();
  });

  test('a wrong password is rejected', async () => {
    await loginPage.open();
    await loginPage.loginWith(VALID_USER, 'definitely-not-the-password');
    await loginPage.expectRejectedWith('Your password is invalid!');
  });

  // Kept as its own test, as in Robot: it is the one that would catch a server
  // collapsing both failures into one generic "login failed".
  test('an unknown user is rejected', async () => {
    await loginPage.open();
    await loginPage.loginWith('ghost-user', VALID_PASSWORD);
    await loginPage.expectRejectedWith('Your username is invalid!');
  });

  const invalidLogins = [
    { username: 'ghost-user', password: VALID_PASSWORD, message: 'Your username is invalid!' },
    { username: VALID_USER, password: 'wrong-password', message: 'Your password is invalid!' },
    { username: '', password: '', message: 'Your username is invalid!' },
    // The same name in the wrong case is a different user, not the same one.
    { username: 'TOMSMITH', password: VALID_PASSWORD, message: 'Your username is invalid!' },
  ];

  for (const { username, password, message } of invalidLogins) {
    test(`invalid login "${username}" / "${password}" shows "${message}"`, async () => {
      await loginPage.open();
      await loginPage.loginWith(username, password);
      await loginPage.expectRejectedWith(message);
    });
  }

  // Not a security test - the session cookie is the username in plain text.
  // What it checks is the redirect: a page behind a login sends you to the
  // login instead of rendering.
  test('the secure page is not reachable without logging in', async ({ page }) => {
    await page.goto('/secure');
    await expect(loginPage.flash).toContainText('You must login to view the secure area!');
    await expect(page).toHaveURL(/\/login$/);
  });
});
