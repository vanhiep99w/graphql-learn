import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'yaml';

const query = '/docs/bat-dau/viet-query-dau-tien';
const terminal = '/docs/bat-dau/kiem-thu-request-curl-postman';
const protocol = '/docs/nen-tang/mo-hinh-request-response';
const architecture = '/docs/tich-hop-spring-for-graphql/kien-truc-spring-for-graphql';
const pages = [query, terminal, protocol, architecture,
  '/docs/schema-va-type-system/interface-va-union', '/docs/query-mutation-subscription/subscription-websocket',
  '/docs/nen-tang/he-sinh-thai-cong-cu'];

async function noPageOverflow(page: Page) {
  // Code/SVG regions may scroll internally, but must not widen the whole document.
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
}
async function svgReady(page: Page) {
  for (const diagram of await page.locator('.d2-diagram').all()) {
    await expect(diagram.locator('.d2-diagram-light > svg')).toHaveCount(1);
    await expect(diagram.locator('.d2-diagram-dark > svg')).toHaveCount(1);
    expect(await diagram.locator('svg').first().getAttribute('viewBox')).toBeTruthy();
  }
}

test('every exported curriculum URL renders its original title and expected D2 count', async ({ request }) => {
  const entries = JSON.parse(await readFile('tests/fixtures/page-contracts.json', 'utf8'));
  for (const entry of entries.filter((p: { frontmatter?: string }) => p.frontmatter)) {
    const route = '/docs/' + entry.path.replace(/^content\/docs\//, '').replace(/\.mdx?$/, '').replace(/(?:^|\/)index$/, '');
    const response = await request.get(route);
    expect(response.status(), route).toBe(200);
    const html = await response.text();
    const frontmatter = parse(entry.frontmatter.replace(/^---\n|\n---$/g, ''));
    expect(html).toContain(frontmatter.title.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;'));
    const source = await readFile(entry.path, 'utf8');
    const d2 = [...source.matchAll(/^```d2\b/gm)].length;
    expect((html.match(/class="d2-diagram not-prose"/g) ?? []).length, route).toBe(d2);
    expect(html).not.toContain('language-mermaid');
    expect(html).not.toContain('icons.d2lang.com');
  }
});

for (const mode of ['light-desktop', 'dark-mobile'] as const) {
  test(`${mode}: diagrams, components, local icons and navigation without browser errors`, async ({ page }, testInfo) => {
    const mobile = mode === 'dark-mobile';
    await page.setViewportSize(mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 });
    await page.addInitScript((theme) => localStorage.setItem('theme', theme), mobile ? 'dark' : 'light');
    const errors: string[] = [];
    const external: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('request', (req) => { if (!req.url().startsWith('http://127.0.0.1:43871') && !req.url().startsWith('data:')) external.push(req.url()); });
    for (const route of pages) {
      await page.goto(route);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('html')).toHaveClass(mobile ? /dark/ : /light/);
      await svgReady(page);
      if (await page.locator('.d2-diagram').count()) {
        const first = page.locator('.d2-diagram').first();
        await expect(first.locator(mobile ? '.d2-diagram-dark' : '.d2-diagram-light')).toBeVisible();
        await expect(first.locator(mobile ? '.d2-diagram-light' : '.d2-diagram-dark')).toBeHidden();
      }
      await noPageOverflow(page);
    }
    const images = page.locator('.d2-diagram image');
    expect(await images.count()).toBeGreaterThan(0);
    for (const image of await images.all()) expect(await image.getAttribute('href') ?? await image.getAttribute('xlink:href')).toMatch(/^data:image\/svg\+xml/);
    await page.locator('.d2-diagram').first().screenshot({ path: testInfo.outputPath(`${mode}-diagram.png`) });
    await page.screenshot({ path: testInfo.outputPath(`${mode}.png`) });
    expect(errors).toEqual([]);
    expect(external).toEqual([]);
  });
}

test('walkthrough step/keyboard navigation, exact copy, diff layout and copy sides', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(query);
  const walkthrough = page.locator('.code-walkthrough');
  await walkthrough.getByRole('button', { name: 'Bước sau', exact: true }).click();
  await expect(walkthrough.locator('[data-line="9"]')).toHaveAttribute('data-highlighted', 'true');
  await walkthrough.getByRole('combobox', { name: 'Chọn bước' }).selectOption('2');
  await expect(walkthrough.locator('[data-line="11"]')).toHaveAttribute('data-highlighted', 'true');
  await walkthrough.getByRole('button', { name: 'Bước trước', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(walkthrough.getByRole('combobox')).toHaveValue('1');
  await walkthrough.getByRole('button', { name: 'Sao chép code', exact: true }).click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain('public String hello()');
  expect(copied).not.toContain('1package');
  const diff = page.locator('.code-diff');
  await diff.getByRole('button', { name: 'Inline', exact: true }).click();
  await expect(diff).toHaveAttribute('data-view', 'inline');
  await diff.getByRole('button', { name: 'Song song', exact: true }).click();
  await expect(diff).toHaveAttribute('data-view', 'split');
  await diff.getByRole('button', { name: 'Sao chép bản sau', exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('@SchemaMapping(typeName = "Query", field = "hello")');
  await diff.getByRole('button', { name: 'Sao chép bản trước', exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(copied);
  const next = page.locator('a[href="/docs/bat-dau/kiem-thu-request-curl-postman"]').first();
  await next.click();
  await expect(page).toHaveURL(new RegExp(terminal));
  await expect(page.locator('h1')).toBeVisible();
});

test('terminal copies raw command; protocol native disclosures and copy; span details and table', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(terminal);
  const session = page.locator('.terminal-session');
  await session.getByRole('button', { name: 'Sao chép lệnh bước 2', exact: true }).click();
  const command = await page.evaluate(() => navigator.clipboard.readText());
  expect(command).toMatch(/^curl --silent --show-error --include/);
  expect(command).not.toContain('HTTP/1.1');
  expect(command).toContain('--data-raw');
  await session.locator('.terminal-session-notes').first().locator('summary').click();
  await expect(session.getByText('Biến GRAPHQL_URL trỏ tới HTTP endpoint', { exact: false })).toBeVisible();
  await page.goto(protocol);
  const exchange = page.locator('.protocol-exchange');
  await exchange.locator('[data-variant="partial"] > summary').click();
  await expect(exchange.locator('[data-variant="partial"]')).toHaveAttribute('open', '');
  await exchange.getByRole('button', { name: 'Sao chép response — Author nullable lỗi', exact: true }).click();
  const response = await page.evaluate(() => navigator.clipboard.readText());
  expect(response).toContain('200');
  expect(response).toContain('Author unavailable');
  expect(response).toContain('"author":null');
  await page.goto(architecture);
  const waterfall = page.locator('.span-waterfall');
  await waterfall.locator('[data-span="reviews"] a').click();
  await expect(waterfall.locator('[data-span="reviews"]')).toHaveAttribute('data-selected', 'true');
  await expect(waterfall.locator('[data-detail="reviews"]')).toHaveAttribute('open', '');
  await waterfall.getByText('Bảng thời gian đầy đủ', { exact: true }).click();
  await expect(waterfall.locator('table')).toBeVisible();
  await expect(waterfall.locator('table tbody tr')).toHaveCount(7);
});

test('large D2 opt-in viewer loads, zooms, expands and restores focus', async ({ page }) => {
  await page.goto(architecture);
  const launch = page.getByRole('button', { name: 'Explore diagram: Spring Boot: transport, runtime và data boundary', exact: true });
  await launch.click();
  const viewer = page.locator('.d2-interactive').first();
  await expect(viewer.getByRole('button', { name: 'Zoom in', exact: true })).toBeVisible();
  await viewer.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await viewer.getByRole('button', { name: 'Expand ↗', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(viewer.getByRole('button', { name: 'Expand ↗', exact: true })).toBeFocused();
});

test('no JavaScript: diagrams, all walkthrough explanations, protocol variants and timing table readable', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  for (const route of pages.slice(0, 4)) {
    await page.goto('http://127.0.0.1:43871' + route);
    await expect(page.locator('h1')).toBeVisible();
    await svgReady(page);
    if (route === terminal) {
      await expect(page.locator('.terminal-session-command').last()).toContainText('curl --silent');
      await expect(page.locator('.terminal-session-output')).toContainText('HTTP/1.1 200 OK');
    }
    await noPageOverflow(page);
  }
  await expect(page.locator('.span-waterfall')).toBeVisible();
  await page.locator('.span-waterfall-table-disclosure > summary').click();
  await expect(page.locator('.span-waterfall table')).toBeVisible();
  await page.goto('http://127.0.0.1:43871' + query);
  await expect(page.locator('.code-walkthrough noscript ol li')).toHaveCount(3);
  await expect(page.locator('.code-diff')).toBeVisible();
  await page.goto('http://127.0.0.1:43871' + protocol);
  await page.locator('[data-variant="partial"] > summary').click();
  await expect(page.locator('[data-variant="partial"] .protocol-exchange-body').last()).toContainText('Author unavailable');
  await context.close();
});
