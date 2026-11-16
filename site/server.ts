/**
 * The site the tests drive, served from this repo.
 *
 * A port of PageServer.py from robot-framework-learning, kept deliberately
 * the same: the same pages, the same two login failures, the same flash
 * messages. The point of this repo is to compare the two tools on one
 * fixture, and that only works if the fixture does not move.
 *
 * Same three rules as the Python version:
 * - port 0, so parallel workers cannot collide on a port;
 * - nothing printed per request;
 * - only what a static file cannot do is handled here (log in, log out, the
 *   redirect away from /secure). This is a fixture, not a reimplementation.
 *
 * And the same honesty: a login test against this server does not test
 * authentication. The accepted password is written a few lines below. What it
 * tests is the locators, the waits and the page object.
 */
import { readFile } from 'node:fs/promises';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import path from 'node:path';

const PAGES = path.resolve(__dirname, 'pages');

// The practice site's credentials, unchanged, so the page object reads the
// same as the Robot one.
const USERS: Record<string, string> = { tomsmith: 'SuperSecretPassword!' };

// Pages carry this marker and the server fills it in on the way out. A flash
// message belongs to one request, so it cannot live in a static file.
const FLASH_MARKER = '<!--FLASH-->';

export interface Site {
  url: string;
  close: () => Promise<void>;
}

export async function startSite(): Promise<Site> {
  const server = createServer((req, res) => {
    handle(req, res).catch(() => send(res, 500, '<h1>Server error</h1>'));
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  return {
    url: `http://127.0.0.1:${port}`,
    close: () =>
      new Promise<void>((resolve) => {
        // Browsers keep connections alive; without this, close() waits for them.
        server.closeAllConnections();
        server.close(() => resolve());
      }),
  };
}

async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0]);

  if (req.method === 'POST' && urlPath === '/login') {
    return logIn(req, res);
  }
  if (req.method !== 'GET') {
    return send(res, 405, '<h1>Method Not Allowed</h1>');
  }
  if (urlPath === '/secure' && !cookie(req, 'session')) {
    return redirect(res, '/login', { flash: 'You must login to view the secure area!' });
  }
  if (urlPath === '/logout') {
    return redirect(res, '/login', { flash: 'You logged out of the secure area!', session: '' });
  }
  return serve(req, res, urlPath);
}

async function logIn(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const fields = new URLSearchParams(await body(req));
  const username = fields.get('username') ?? '';
  const password = fields.get('password') ?? '';
  // Two different failures, and the site tells them apart. The suite has a
  // test for exactly that, so the fixture has to keep them apart too.
  if (!(username in USERS)) {
    return redirect(res, '/login', { flash: 'Your username is invalid!' });
  }
  if (USERS[username] !== password) {
    return redirect(res, '/login', { flash: 'Your password is invalid!' });
  }
  return redirect(res, '/secure', { flash: 'You logged into a secure area!', session: username });
}

async function serve(req: IncomingMessage, res: ServerResponse, urlPath: string): Promise<void> {
  const relative = urlPath.replace(/^\/+|\/+$/g, '') || 'index';
  const file = path.resolve(PAGES, `${relative}.html`);
  // decodeURIComponent above turns "/%2e%2e%2f" into "../", so this check does
  // real work: a URL must not walk out of pages/ and serve the rest of the repo.
  if (!file.startsWith(PAGES + path.sep)) {
    return send(res, 404, '<h1>Not Found</h1>');
  }
  let html: string;
  try {
    html = await readFile(file, 'utf-8');
  } catch {
    return send(res, 404, '<h1>Not Found</h1>');
  }
  const flash = cookie(req, 'flash');
  html = html.replace(FLASH_MARKER, flash ? `<div id="flash" class="flash">${flash}</div>` : '');
  // A flash is shown once. Clearing it here stops it following the browser
  // onto the next page.
  send(res, 200, html, { cookies: flash ? ['flash=; Path=/; Max-Age=0'] : [] });
}

function redirect(
  res: ServerResponse,
  location: string,
  { flash, session }: { flash?: string; session?: string },
): void {
  const cookies: string[] = [];
  if (flash) cookies.push(`flash=${encodeURIComponent(flash)}; Path=/`);
  if (session !== undefined) {
    cookies.push(session ? `session=${session}; Path=/` : 'session=; Path=/; Max-Age=0');
  }
  // 303, not 302: it tells the browser to follow up with a GET, which turns a
  // form POST into an ordinary page load.
  send(res, 303, '', { location, cookies });
}

function send(
  res: ServerResponse,
  status: number,
  html: string,
  { location, cookies = [] }: { location?: string; cookies?: string[] } = {},
): void {
  if (res.headersSent) return;
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  if (location) res.setHeader('Location', location);
  if (cookies.length) res.setHeader('Set-Cookie', cookies);
  res.end(html);
}

function cookie(req: IncomingMessage, name: string): string {
  for (const part of (req.headers.cookie ?? '').split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return '';
}

function body(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.setEncoding('utf-8');
    req.on('data', (chunk: string) => (data += chunk));
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}
