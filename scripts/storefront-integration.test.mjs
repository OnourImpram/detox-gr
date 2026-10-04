import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const source = path => existsSync(resolve(root, path)) ? readFileSync(resolve(root, path), 'utf8') : '';
test('product detail distinguishes preview lists from approved purchases', () => {
  const code = source('src/routes/p.$slug.tsx');
  assert.match(code, /saleBlockers/);
  assert.match(code, /usePaymentsEnabled/);
  assert.match(code, /addToList/);
  assert.doesNotMatch(code, /shippingEur/);
});
test('checkout layout renders its receipt and cancellation child routes', () => {
  const code = source('src/routes/odeme.tsx');
  assert.match(code, /<Outlet/);
  assert.match(code, /usePaymentsEnabled/);
  assert.doesNotMatch(code, /shippingEur|addressOnStripe/);
});
test('preview selection does not pretend a demo shipping estimate is a payable total', () => {
  const code = source('src/routes/sepet.tsx');
  assert.match(code, /previewBody/);
  assert.match(code, /saleBlockers/);
  assert.doesNotMatch(code, /shippingEur|etaText/);
});
test('category pages use the same discovery experience and reject unknown categories in loaders', () => {
  const code = source('src/routes/shop.$category.tsx');
  assert.match(code, /ProductExplorer/);
  assert.match(code, /loader:[\s\S]*throw notFound/);
});
test('new interface has complete copy for all twenty supported locales', async () => {
  const { STOREFRONT_COPY, COPY_KEYS, ux } = await import('../src/lib/storefront-copy.ts');
  const { LOCALES } = await import('../src/lib/i18n-locales.ts');
  assert.equal(LOCALES.length, 20);
  for (const { code } of LOCALES) {
    assert.equal(STOREFRONT_COPY[code].length, COPY_KEYS.length, code);
    for (const key of COPY_KEYS) assert.ok(ux(code, key, { shown: 24, total: 226 }).trim());
    assert.doesNotMatch(ux(code, 'shown', { shown: 24, total: 226 }), /\{\w+\}/);
  }
});

test('static document shell does not hydrate locale-dependent content with a different root match ID', () => {
  const code = source('src/routes/__root.tsx');
  assert.match(code, /ssr: STATIC_PREVIEW \? false : true/);
  assert.match(code, /shellComponent: Document/);
  assert.match(code, /useHydrated/);
  assert.doesNotMatch(code, /suppressHydrationWarning/);
});
