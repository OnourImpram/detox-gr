import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
const root = resolve(import.meta.dirname, '..');
const path = file => resolve(root, file);
const read = file => readFileSync(path(file), 'utf8');
const manifestFile = 'src/data/product-media-v3.json';

test('v3 commits a product-specific manifest instead of an unapplied patch', () => {
  assert.ok(existsSync(path(manifestFile)), 'versioned media registry is missing');
  const manifest = JSON.parse(read(manifestFile));
  assert.deepEqual(Object.keys(manifest.products).sort(), ['DT002','DT101','DT117','DT157']);
  for (const [id, media] of Object.entries(manifest.products)) {
    assert.equal(media.sourceId, id);
    assert.equal(media.kind, 'illustration');
    assert.equal(media.verifiedProductPhoto, false);
    assert.match(media.originalSha256, /^[a-f0-9]{64}$/);
    assert.ok(media.variants.length >= 3);
    assert.equal(media.width / media.height, 4/3);
    for (const variant of media.variants) {
      assert.ok(variant.src.startsWith('/media/v3/'));
      assert.ok(existsSync(path(`public${variant.src}`)));
      const bytes = readFileSync(path(`public${variant.src}`));
      assert.equal(bytes.length, variant.bytes);
      assert.equal(createHash('sha256').update(bytes).digest('hex'), variant.sha256);
    }
  }
});

test('retired synthetic product library cannot ship with v3', () => {
  assert.equal(existsSync(path('public/products')), false, 'old synthetic product library is still shipped');
  assert.equal(existsSync(path('public/__grok')), false, 'obsolete platform icons still ship');
});

test('catalogue source never falls back to a category photo as a product photo', () => {
  const code = read('src/lib/catalog.ts');
  assert.doesNotMatch(code, /\/products\/|GALLERY\[category\]/);
  assert.match(code, /productMedia/);
});

test('all twenty locales disclose AI illustration, pending photo and verified photo', () => {
  assert.ok(existsSync(path('src/data/media-copy.json')), 'media disclosures are missing');
  const copy = JSON.parse(read('src/data/media-copy.json'));
  assert.equal(Object.keys(copy).length, 20);
  const keys = Object.keys(copy.tr).sort();
  for (const row of Object.values(copy)) {
    assert.deepEqual(Object.keys(row).sort(), keys);
    assert.ok(row.illustration && row.disclosure && row.pending && row.verified);
  }
});

test('the manifest contains no obsolete platform icon', () => {
  const manifest = JSON.parse(read('public/manifest.webmanifest'));
  assert.ok(manifest.icons.length >= 2);
  assert.ok(manifest.icons.every(icon => !icon.src.includes('__grok')));
  assert.equal(manifest.start_url, './');
});
