import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';

const address = process.env.SITE_URL;
const expectedCommit = process.env.EXPECTED_COMMIT;
assert.ok(address && expectedCommit, 'SITE_URL and EXPECTED_COMMIT are required');
const base = new URL(address.endsWith('/') ? address : `${address}/`);
assert.equal(base.protocol, 'https:');
const registry = JSON.parse(readFileSync('src/data/product-media-v3.json', 'utf8'));
const report = { ok: false, site: base.href, expectedCommit, checks: [], errors: [], media: [] };
mkdirSync('qa-live', { recursive: true });
let browser;
let page;
const resolve = path => new URL(path.replace(/^\//, ''), base).href;
async function readJson(path) {
  const response = await fetch(`${resolve(path)}?proof=${expectedCommit}`, { cache: 'no-store' });
  assert.equal(response.status, 200, path);
  return response.json();
}
try {
  // Pages CDN propagation is independent of the completed deployment transaction.
  for (let attempt = 0; attempt < 24; attempt++) {
    try {
      const build = await readJson('build.json');
      if (build.commit === expectedCommit) { report.build = build; break; }
    } catch { /* Retry only deployment propagation. Actual verification follows. */ }
    await delay(5000);
  }
  assert.equal(report.build?.commit, expectedCommit, 'The deployed commit did not reach the public URL');
  const version = await readJson('version.json');
  assert.equal(version.version, JSON.parse(readFileSync('src/data/release.json','utf8')).version);
  assert.equal(version.paymentActivated, false);
  report.checks.push('Public build commit and catalogue-preview version match');
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 1000 } });
  page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') report.errors.push(message.text()); });
  page.on('request', request => {
    const url = new URL(request.url());
    if (/\/(?:products|__grok)\//.test(url.pathname)) report.errors.push(`Retired media request ${url.pathname}`);
  });
  await page.goto(`${base.href}?lang=tr&v=3`, { waitUntil: 'networkidle' });
  await page.locator('.ed-featured').waitFor();
  assert.equal(await page.locator('[data-testid="preview-notice"]').count(), 1);
  for (const id of Object.keys(registry.products)) {
    const card = page.locator(`.ed-featured [data-product-id="${id}"]`);
    await card.scrollIntoViewIfNeeded();
    const image = card.locator('img');
    await image.evaluate(el => el.decode());
    const data = await image.evaluate(el => ({ src: el.currentSrc, width: el.naturalWidth, height: el.naturalHeight }));
    assert.ok(data.src.includes('/media/generated/'), id);
    assert.ok(data.width > 0, id);
    report.media.push({ id, ...data });
  }
  await page.locator('.ed-featured').screenshot({ path: 'qa-live/v3-live-featured.png' });
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 750) {
      scrollTo(0, y); await new Promise(resolve => setTimeout(resolve, 30));
    }
    await document.fonts.ready;
    scrollTo(0, 0);
  });
  await page.screenshot({ path: 'qa-live/v3-live-home.png', fullPage: true });
  report.checks.push('Four new generated images are actually selected by the live browser');
  await page.locator('[data-product-id="DT117"] a').first().click();
  await page.locator('.v3-pdp-media[data-media-for="DT117"]').waitFor();
  await page.locator('.v3-pdp-media img').evaluate(el => el.decode());
  assert.ok((await page.locator('.v3-pdp-media img').evaluate(el => el.currentSrc)).includes('/media/generated/'));
  await page.screenshot({ path: 'qa-live/v3-live-product.png', fullPage: true });
  await page.locator('.dt-pdp__actions > button').click();
  await page.locator('.dt-cart-link').click();
  await page.locator('.dt-cart-line [data-media-kind="illustration"]').waitFor();
  assert.equal(await page.locator('.dt-cart-line').count(), 1);
  report.checks.push('Live product detail and saved selection use the same new media');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base.href}?lang=el&v=3`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('html').getAttribute('lang'), 'el');
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await page.screenshot({ path: 'qa-live/v3-live-el-mobile.png', fullPage: true });
  for (const media of Object.values(registry.products)) for (const variant of media.variants) {
    const response = await fetch(resolve(variant.src));
    assert.equal(response.status, 200, variant.src);
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.equal(createHash('sha256').update(bytes).digest('hex'), variant.sha256);
  }
  report.checks.push('All 16 public WebP files match their registered SHA256');
  assert.deepEqual(report.errors, []);
  report.ok = true;
  console.log(`Live v3 verified at ${base.href} for commit ${expectedCommit}`);
} catch (error) {
  report.failure = String(error);
  console.error(error);
  process.exitCode = 1;
  await page?.screenshot({ path: 'qa-live/failure.png', fullPage: true }).catch(() => undefined);
} finally {
  writeFileSync('qa-live/live-proof.json', JSON.stringify(report, null, 2));
  await browser?.close();
}
