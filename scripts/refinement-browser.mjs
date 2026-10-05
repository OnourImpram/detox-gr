import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';
import assert from 'node:assert/strict';

const live = Boolean(process.env.SITE_URL);
const base = (process.env.SITE_URL ?? 'http://127.0.0.1:8098/detox-gr').replace(/\/$/, '');
const out = live ? 'qa-live' : 'qa-evidence';
const read = path => JSON.parse(readFileSync(path, 'utf8'));
const copy = read('src/data/refinement-copy.json');
const release = read('src/data/release.json');
const report = { ok: false, version: release.version, base, live, checks: [], layouts: [], errors: [] };
mkdirSync(out, { recursive: true });
const server = live ? null : spawn(process.execPath, ['scripts/serve-storefront-preview.mjs'], { env: { ...process.env, QA_PORT: '8098' }, stdio: 'ignore' });
let browser, page;
const href = path => `${base}${path}`;
const money = text => Number(text.replace(/[^\d,.-]/g, '').replace(',', '.'));
async function visit(path) {
  const response = await page.goto(href(path), { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200, `Document ${path}`);
  await page.locator('h1').waitFor();
}
async function query(text) {
  await page.locator('.dt-explorer__search input').fill(text);
  await page.waitForFunction(expected => new URL(location.href).searchParams.get('q') === expected, text);
}
async function product(id, locale = 'tr') {
  await visit(`/shop?lang=${locale}&q=${id}`);
  await page.locator(`[data-product-id=${id}] > a`).click();
  await page.locator('.dt-pdp').waitFor();
}
async function layout(name) {
  const item = await page.evaluate(() => ({
    width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
    title: document.querySelector('h1')?.textContent, lang: document.documentElement.lang,
    broken: [...document.images].filter(el => el.complete && !el.naturalWidth).map(el => el.currentSrc),
    overflow: [...document.querySelectorAll('main *, header *')].filter(el => el.getBoundingClientRect().right > innerWidth + 1).slice(0,12).map(el => ({ tag: el.tagName, class: typeof el.className === 'string' ? el.className : '', right: el.getBoundingClientRect().right, text: el.textContent?.slice(0,100) })),
  }));
  report.layouts.push({ name, ...item });
  assert.ok(item.scrollWidth <= item.width + 1, `${name} overflows ${item.scrollWidth}/${item.width}`);
  assert.equal(item.broken.length, 0, `${name} broken image`);
}
async function screenshot(name) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 700) { scrollTo(0, y); await new Promise(resolve => setTimeout(resolve, 15)); }
    await document.fonts.ready; scrollTo(0,0);
  });
  await page.screenshot({ path: `${out}/refinement-${name}.png`, fullPage: true });
}
try {
  if (live) {
    assert.ok(process.env.EXPECTED_COMMIT, 'EXPECTED_COMMIT required for live verification');
    const actual = await (await fetch(href(`/build.json?check=${process.env.EXPECTED_COMMIT}`))).json();
    assert.equal(actual.commit, process.env.EXPECTED_COMMIT); assert.equal(actual.version, release.version);
    report.build = actual;
  } else {
    for (let i = 0; i < 80; i++) { try { if ((await fetch(href('/'))).ok) break; } catch { /* Preview starting. */ } await delay(100); }
  }
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'], ...(process.env.BROWSER_EXECUTABLE_PATH ? { executablePath: process.env.BROWSER_EXECUTABLE_PATH } : {}) });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(base).origin });
  page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  page.on('console', msg => { if (msg.type() === 'error') report.errors.push(`${msg.text()} ${msg.location().url}`); });

  await visit('/?lang=tr'); await layout('home-desktop'); await screenshot('home-desktop');
  assert.equal(await page.locator('.ed-archive-bridge').count(), 0);
  assert.equal(await page.locator('.scene-category-section a[href*="kompozisyonlar"]').count(), 0);
  report.checks.push('Homepage leads to actual shopping categories rather than an internal image showcase');
  await visit('/hikaye?lang=tr');
  assert.ok(!(await page.locator('main').innerText()).includes('Bu geçmiş bir biyografi bilgisidir'));
  assert.ok((await page.locator('main').innerText()).includes('Mpizaniou 14'));
  await screenshot('story-desktop');

  await visit('/shop?lang=tr');
  assert.equal(await page.locator('[data-product-id]').count(), 24);
  assert.equal(await page.locator('[data-testid=product-grid] [data-media-kind=pending]').count(), 0);
  await screenshot('catalogue-desktop');
  await query('lavanta');
  const searchCount = await page.locator('[data-product-id]').count();
  assert.ok(searchCount >= 3);
  await page.locator('[data-product-id=DT077] > a').click(); await page.locator('.dt-pdp').waitFor();
  await page.goBack({ waitUntil: 'networkidle' });
  assert.equal(new URL(page.url()).searchParams.get('q'), 'lavanta');
  assert.equal(await page.locator('.dt-explorer__search input').inputValue(), 'lavanta');
  assert.equal(await page.locator('[data-product-id]').count(), searchCount);
  report.checks.push('Unsubmitted live search survives a product visit and browser Back');
  await query('lavanta ');
  assert.equal(await page.locator('.dt-explorer__search input').inputValue(), 'lavanta ');
  await query('lavnata');
  await page.locator('.rf-suggestions button').first().click();
  assert.equal(new URL(page.url()).searchParams.get('q')?.toLocaleLowerCase('tr'), 'lavanta');
  report.checks.push('A trailing space is preserved; typo suggestions come from actual catalogue names');
  await page.getByRole('button', { name: copy.tr.list, exact: true }).click();
  assert.equal(new URL(page.url()).searchParams.get('view'), 'list');
  await page.locator('.dt-language-select').selectOption('el');
  await page.waitForFunction(() => document.documentElement.lang === 'el');
  assert.equal(new URL(page.url()).searchParams.get('q'), 'lavanta');
  assert.equal(new URL(page.url()).searchParams.get('view'), 'list');
  await screenshot('catalogue-list-greek');
  report.checks.push('View mode and search survive switching the language');

  await visit('/shop?lang=tr');
  await page.locator('.dt-pagination button').click();
  await page.waitForFunction(() => document.querySelectorAll('[data-product-id]').length === 48);
  assert.ok(await page.locator('[data-product-id] > a').nth(24).evaluate(el => el === document.activeElement));
  report.checks.push('Loading more products moves keyboard focus to the first newly revealed item');

  await product('DT002');
  const productUrl = page.url();
  assert.equal(Number((await page.locator('.dt-pdp__actions .rf-quantity input').inputValue()).replace(',', '.')), .25);
  assert.equal(money(await page.locator('.rf-line-amount strong').innerText()), 3.98);
  await page.getByRole('button', { name: '500 g', exact: true }).click();
  assert.equal(money(await page.locator('.rf-line-amount strong').innerText()), 7.95);
  await page.locator('.dt-pdp__actions > button').click();
  assert.ok((await page.locator('.rf-in-list').innerText()).includes('500 g'));
  await screenshot('weight-product-desktop');
  await page.locator('.dt-cart-link').click(); await page.locator('.dt-cart-line').waitFor();
  const amount = page.locator('.dt-cart-line .rf-quantity input');
  await amount.fill('0,75'); await amount.blur();
  assert.equal(money(await page.locator('.dt-cart-line__total').innerText()), 11.93);
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(Number((await amount.inputValue()).replace(',', '.')), .75);
  assert.equal(money(await page.locator('.dt-cart__summary dd').first().innerText()), 11.93);
  const state = JSON.parse(await page.evaluate(() => localStorage.getItem('detoks-gr-shop-v4')));
  assert.equal(state.state.cart[0].qty, .75);
  await page.locator('.dt-note-label textarea').fill('PRIVATE_REFINE_NOTE');
  await page.locator('.rf-list-tools button').first().click();
  await page.waitForFunction(label => document.querySelector('.rf-list-tools button')?.textContent?.includes(label), copy.tr.copied);
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  assert.ok(copied.includes('750 g') && copied.includes('DT002') && copied.includes('PRIVATE_REFINE_NOTE'));
  assert.ok(copied.includes(`${base}/shop?lang=tr`), `Invalid shared link: ${copied}`);
  assert.ok(!(await page.evaluate(() => localStorage.getItem('detoks-gr-shop-v4'))).includes('PRIVATE_REFINE_NOTE'));
  const inquiry = new URL(await page.locator('.dt-cart__summary a[href*="wa.me"]').getAttribute('href')).searchParams.get('text');
  assert.equal(inquiry, copied);
  await screenshot('list-desktop');
  report.checks.push('250g=EUR3.98, 500g=EUR7.95 and 750g=EUR11.93; weight survives refresh and message/copy are identical');
  // Expected clipboard denial is caught and offers a selectable message, without sending anything.
  await page.evaluate(() => { navigator.clipboard.writeText = async () => { throw new Error('Controlled clipboard denial'); }; });
  await page.locator('.rf-list-tools button').first().click();
  await page.locator('.rf-message-text').waitFor({ state: 'visible' });
  assert.equal(await page.locator('.rf-message-text').inputValue(), inquiry);
  report.checks.push('Clipboard denial offers a selectable text fallback; notes are not persisted');

  await product('DT117');
  const directText = new URL(await page.locator('.dt-pdp__question').getAttribute('href')).searchParams.get('text');
  assert.ok(directText.includes(`${base}/p/elma-sirkesi?lang=tr`));
  await page.locator('.dt-pdp__actions .rf-quantity input').fill('1.5');
  await page.locator('.dt-pdp__actions .rf-quantity input').blur();
  assert.equal(await page.locator('.dt-pdp__actions .rf-quantity input').inputValue(), '1');
  report.checks.push('Packet counts stay whole numbers and shared product links include the deployment base');

  await product('DT001');
  const opener = page.locator('.rf-enlarge');
  await opener.click(); await page.locator('.rf-product-dialog[open]').waitFor();
  assert.ok(await page.locator('.rf-dialog-close').evaluate(el => el === document.activeElement));
  const firstScene = await page.locator('.rf-product-full').getAttribute('data-scene-id');
  await page.keyboard.press('ArrowRight');
  assert.notEqual(await page.locator('.rf-product-full').getAttribute('data-scene-id'), firstScene);
  for (let n = 0; n < 6; n++) { await page.keyboard.press('Tab'); assert.ok(await page.evaluate(() => document.querySelector('.rf-product-dialog').contains(document.activeElement))); }
  await page.screenshot({ path: `${out}/refinement-product-zoom.png` });
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.rf-product-dialog[open]').count(), 0);
  assert.ok(await opener.evaluate(el => el === document.activeElement));
  assert.notEqual(await page.evaluate(() => document.body.style.overflow), 'hidden');
  report.checks.push('Full-size product viewer supports alternatives, keyboard focus containment, Escape and focus restoration');

  for (const locale of Object.keys(copy)) {
    await page.setViewportSize({ width: 320, height: 900 });
    await visit(`/shop?lang=${locale}&view=list&q=DT018`);
    await layout(`list-${locale}-320`);
    const title = await page.locator('[data-product-id=DT018] h3').innerText();
    assert.ok(!title.includes('Flavoured') && !title.includes('aromalı'));
    await page.locator('[data-product-id=DT018] > a').click(); await page.locator('.dt-pdp').waitFor();
    await layout(`soap-${locale}-320`);
    await visit(`${new URL(productUrl).pathname.replace(new URL(base).pathname, '')}?lang=${locale}`);
    await layout(`weight-${locale}-320`);
    assert.equal(await page.locator('.dt-pdp__actions input').getAttribute('aria-valuenow'), '0.25');
    await visit(`/sepet?lang=${locale}`); await layout(`selection-${locale}-320`);
    if (['tr','el','en'].includes(locale)) await screenshot(`list-${locale}-mobile`);
  }
  for (const width of [390,768,1024,1440]) {
    await page.setViewportSize({ width, height: 950 });
    await visit('/?lang=tr'); await layout(`home-${width}`);
    if (width === 390) await screenshot('home-mobile');
  }
  assert.deepEqual(report.errors, []);
  report.ok = true;
  console.log(`Refinement passed. ${report.checks.length} customer journeys, ${report.layouts.length} layouts. No live messages sent.`);
} catch (error) {
  report.failure = String(error); console.error(error); process.exitCode = 1;
  await page?.screenshot({ path: `${out}/refinement-failure.png`, fullPage: true }).catch(() => {});
} finally {
  writeFileSync(`${out}/refinement-browser.json`, JSON.stringify(report, null, 2));
  await browser?.close(); server?.kill();
}
