import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';
import assert from 'node:assert/strict';
const root = 'http://127.0.0.1:8092';
const base = `${root}/detox-gr`;
const out = 'qa-evidence';
mkdirSync(out, { recursive: true });
const server = spawn(process.execPath, ['scripts/serve-storefront-preview.mjs'], { stdio: 'ignore' });
let browser;
let page;
const observations = [];
const errors = [];
async function shot(page, name) {
  await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 700) { scrollTo(0,y); await new Promise(resolve => setTimeout(resolve, 25)); } scrollTo(0,0); await document.fonts.ready; });
  await page.waitForTimeout(150);
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
}
async function inspect(page, name) {
  const result = await page.evaluate(() => ({
    title: document.title,
    lang: document.documentElement.lang,
    width: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    h1: document.querySelector('h1')?.textContent?.trim() ?? '',
    bodyLength: document.body.innerText.length,
    brokenImages: Array.from(document.images).filter(image => image.complete && image.naturalWidth === 0).map(image => image.src),
    overflowElements: Array.from(document.body.querySelectorAll('*')).map(element => ({ tag: element.tagName, class: element.className?.toString(), text: element.textContent?.slice(0,70), right: element.getBoundingClientRect().right, width: element.getBoundingClientRect().width })).filter(element => element.right > innerWidth + 1).slice(0,16),
    robots: [...document.querySelectorAll('meta[name="robots"]')].map(meta => meta.content),
  }));
  observations.push({ name, ...result });
  assert.ok(result.bodyLength > 150, `${name}: blank page`);
  assert.ok(result.h1, `${name}: missing heading`);
  assert.ok(result.scrollWidth <= result.width + 1, `${name}: horizontal overflow ${result.scrollWidth}/${result.width}`);
  assert.equal(result.brokenImages.length, 0, `${name}: broken images`);
}
try {
  for (let i = 0; i < 80; i++) { try { if ((await fetch(`${base}/`)).ok) break; } catch { /* The preview process may still be starting. */ } await delay(100); }
  browser = await chromium.launch({ ...(process.env.BROWSER_EXECUTABLE_PATH ? { executablePath: process.env.BROWSER_EXECUTABLE_PATH } : {}), headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.route('**/*', route => {
    const url = route.request().url();
    if (url.startsWith(root) || url.startsWith('data:')) return route.continue();
    errors.push(`Unexpected external request: ${url}`); return route.abort();
  });
  for (const locale of ['tr','el','en','de','fr','it','es','nl','pl','no','bg','ro','sv','da','fi','pt','hu','cs','hr','sk']) {
    await page.setViewportSize({ width: 320, height: 850 });
    await page.goto(`${base}/?lang=${locale}`, { waitUntil: 'networkidle' });
    await inspect(page, `home-${locale}-320`);
    assert.equal(await page.locator('html').getAttribute('lang'), locale === 'no' ? 'nb' : locale);
    if (['tr','el','en'].includes(locale)) await shot(page, `home-${locale}-mobile`);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${base}/?lang=tr`, { waitUntil: 'networkidle' });
  await inspect(page, 'home-tr-desktop'); await shot(page, 'home-tr-desktop');
  await page.goto(`${base}/shop?lang=tr`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('[data-product-id]').count(), 24);
  await page.locator('.dt-pagination button').click();
  await page.waitForFunction(() => document.querySelectorAll('[data-product-id]').length === 48);
  await page.locator('.dt-explorer__search input').fill('sirke');
  await page.locator('.dt-explorer__search input').press('Enter');
  await page.waitForTimeout(200);
  assert.ok((await page.locator('[data-product-id]').count()) > 0);
  await page.locator('.dt-language-select').selectOption('el');
  await page.waitForTimeout(300);
  assert.equal(new URL(page.url()).searchParams.get('q'), 'sirke');
  await page.locator('.dt-language-select').selectOption('tr');
  await page.waitForTimeout(200);
  assert.equal(new URL(page.url()).searchParams.get('lang'), 'tr');
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('html').getAttribute('lang'), 'tr');
  await inspect(page, 'search-language-persistence');
  await page.goto(`${base}/shop?lang=el&shelf=house`, { waitUntil: 'networkidle' });
  await inspect(page, 'shop-el-house'); await shot(page, 'shop-el-house');
  await page.goto(`${base}/shop?lang=tr`, { waitUntil: 'networkidle' });
  await shot(page, 'shop-tr-desktop');
  await page.locator('[data-product-id="DT117"] a').first().click();
  await page.waitForTimeout(200);
  await inspect(page, 'product-tr'); await shot(page, 'product-tr-desktop');
  await page.locator('.dt-pdp__actions > button').click();
  await page.goto(`${base}/sepet?lang=tr`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('.dt-cart-line').count(), 1);
  await page.locator('.dt-note-label textarea').fill('PRIVATE_QA_NOTE');
  const stored = await page.evaluate(() => localStorage.getItem('detoks-gr-shop-v4'));
  assert.ok(!stored.includes('PRIVATE_QA_NOTE') && !stored.includes('orders') && !stored.includes('email'));
  await page.setViewportSize({ width: 390, height: 844 });
  await inspect(page, 'list-mobile'); await shot(page, 'list-tr-mobile');
  await page.evaluate(() => { const existing = JSON.parse(localStorage.getItem('detoks-gr-shop-v4')); existing.state.orders = [{ email: 'private@example.test', address: 'PRIVATE_QA_ADDRESS' }]; existing.state.note = 'PRIVATE_QA_NOTE'; localStorage.setItem('detoks-gr-shop-v4', JSON.stringify(existing)); });
  await page.reload({ waitUntil: 'networkidle' });
  const purged = await page.evaluate(() => localStorage.getItem('detoks-gr-shop-v4'));
  assert.ok(!purged.includes('PRIVATE_QA') && !purged.includes('private@example.test'));
  await page.goto(`${base}/odeme?lang=el`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('input[type="email"]').count(), 0);
  await inspect(page, 'closed-checkout');
  await page.goto(`${base}/odeme/iptal?lang=el`, { waitUntil: 'networkidle' });
  await inspect(page, 'cancellation-child');
  await page.goto(`${base}/p/does-not-exist?lang=en`, { waitUntil: 'networkidle' });
  assert.ok((await page.locator('main').innerText()).includes('404'));
  await inspect(page, 'not-found');
  await page.goto(`${base}/?lang=el`, { waitUntil: 'networkidle' });
  await page.locator('.dt-menu-button').click();
  assert.ok(await page.locator('#mobile-search').evaluate(input => input === document.activeElement));
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.dt-menu-button').getAttribute('aria-expanded'), 'false');
  assert.equal(errors.length, 0, errors.join('\n'));
  writeFileSync(`${out}/browser.json`, JSON.stringify({ ok: true, observations, errors }, null, 2));
  console.log(`Browser checks passed. ${observations.length} viewport/route observations and interactive scenarios.`);
} catch (error) {
  await page?.screenshot({ path: `${out}/failure.png`, fullPage: true }).catch(() => undefined);
  writeFileSync(`${out}/browser.json`, JSON.stringify({ ok: false, error: String(error), observations, errors }, null, 2));
  console.error(error); process.exitCode = 1;
} finally { await browser?.close(); server.kill(); }
