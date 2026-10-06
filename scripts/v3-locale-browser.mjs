import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';
import assert from 'node:assert/strict';
const origin = 'http://127.0.0.1:8092';
const base = `${origin}/detox-gr`;
const errors = [];
const observations = [];
const server = spawn(process.execPath, ['scripts/serve-storefront-preview.mjs'], { stdio: 'ignore' });
let browser;
const report = { ok: false, observations, errors };
mkdirSync('qa-evidence', { recursive: true });
try {
  for (let i = 0; i < 80; i++) {
    try { if ((await fetch(`${base}/`)).ok) break; } catch { /* Preview is starting. */ }
    await delay(100);
  }
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'], ...(process.env.BROWSER_EXECUTABLE_PATH ? { executablePath: process.env.BROWSER_EXECUTABLE_PATH } : {}) });
  // Each run is a new browser context. No previously loaded editorial pack can hide a race.
  for (const locale of ['el', 'fi', 'de']) {
    const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    let delayedRequests = 0;
    await page.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin !== origin) throw new Error(`Unexpected external request ${url}`);
      if (url.pathname.includes(`/assets/${locale}-`) && url.pathname.endsWith('.js')) {
        delayedRequests++;
        await delay(1200);
      }
      await route.continue();
    });
    await page.goto(`${base}/shop?lang=tr&q=DT117`, { waitUntil: 'networkidle' });
    const heading = await page.locator('h1').innerText();
    await page.locator('.dt-language-select').selectOption(locale);
    await page.waitForTimeout(150);
    assert.equal(await page.locator('html').getAttribute('lang'), 'tr', `${locale}: unready locale was exposed`);
    assert.equal(await page.locator('h1').innerText(), heading, `${locale}: old content disappeared during dictionary load`);
    await page.waitForFunction(expected => document.documentElement.lang === expected && document.querySelector('.dt-language-select').value === expected, locale);
    assert.ok(delayedRequests > 0, `${locale}: test did not exercise a cold dictionary request`);
    const pack = JSON.parse(readFileSync(`src/data/brand/${locale}.json`, 'utf8'));
    assert.ok((await page.locator('.dt-footer__links').innerText()).includes(pack['archive.title']));
    assert.equal(new URL(page.url()).searchParams.get('q'), 'DT117');
    assert.equal(await page.locator('[data-product-id="DT117"]').count(), 1);
    observations.push({ from: 'tr', to: locale, delayMs: 1200, delayedRequests, queryPreserved: true, visibleContentStayedReady: true });
    await context.close();
  }
  assert.deepEqual(errors, []);
  report.ok = true;
  console.log(`Cold locale transitions passed: ${observations.length} deliberately delayed dictionary loads, no rendering errors.`);
} catch (error) {
  report.failure = String(error);
  console.error(error);
  process.exitCode = 1;
} finally {
  writeFileSync('qa-evidence/v3-locale-browser.json', JSON.stringify(report, null, 2));
  await browser?.close();
  server.kill();
}
