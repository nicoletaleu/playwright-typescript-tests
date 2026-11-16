/**
 * Page object for the login page - the port of resources/login_page.resource.
 *
 * Same idea, different shape. In Robot a page object is a resource file of
 * variables and keywords; here it is a class, and the locators are typed
 * properties instead of strings. The practical difference shows up in the
 * editor: a misspelt `loginPage.flash` is underlined before anything runs,
 * where a misspelt ${FLASH_MESSAGE} is an empty string until the test fails.
 *
 * The locators changed style on purpose. The Robot version uses CSS (`id=...`,
 * `button[type=submit]`); this one uses getByLabel / getByRole, which find
 * elements the way a user would and break when the page stops being usable,
 * not when an id is renamed. The flash message has no role or label, so it
 * stays a CSS id - that is the honest exception, not a style lapse.
 */
import { expect, type Locator, type Page } from '@playwright/test';

export const VALID_USER = 'tomsmith';
export const VALID_PASSWORD = 'SuperSecretPassword!';

export class LoginPage {
  readonly username: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly flash: Locator;
  readonly logoutLink: Locator;

  constructor(private readonly page: Page) {
    this.username = page.getByLabel('Username');
    this.password = page.getByLabel('Password');
    this.submit = page.getByRole('button', { name: 'Login' });
    this.flash = page.locator('#flash');
    // The secure page mentions "logout" in its text too; a role locator only
    // matches the link, which is what the Robot version needed a CSS
    // attribute selector for.
    this.logoutLink = page.getByRole('link', { name: 'Logout' });
  }

  async open(): Promise<void> {
    await this.page.goto('/login');
    await expect(this.page.getByRole('heading', { name: 'Login Page' })).toBeVisible();
  }

  async loginWith(username: string, password: string): Promise<void> {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.submit.click();
  }

  async loginWithValidCredentials(): Promise<void> {
    await this.loginWith(VALID_USER, VALID_PASSWORD);
  }

  async expectLoggedIn(): Promise<void> {
    await expect(this.page).toHaveURL(/\/secure$/);
    await expect(this.flash).toContainText('You logged into a secure area!');
  }

  async expectRejectedWith(message: string): Promise<void> {
    await expect(this.flash).toContainText(message);
    await expect(this.page).toHaveURL(/\/login$/);
  }

  async logout(): Promise<void> {
    await this.logoutLink.click();
    await expect(this.flash).toContainText('You logged out of the secure area!');
  }
}
