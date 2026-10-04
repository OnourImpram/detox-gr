import test from 'node:test';
import assert from 'node:assert/strict';
import { featuredName, FEATURED_NAMES, FEATURED_NAME_IDS } from '../src/lib/featured-names.ts';
import { LOCALES } from '../src/lib/i18n-locales.ts';
test('eight featured products have whole names in every locale', () => {
  for (const { code } of LOCALES) {
    assert.equal(FEATURED_NAMES[code].length, FEATURED_NAME_IDS.length);
    for (const id of FEATURED_NAME_IDS) assert.ok(featuredName(id, code)?.trim());
  }
});
test('Greek hero does not leak the untranslated Turkish vinegar name', () => {
  assert.equal(featuredName('DT117', 'el'), 'Ξίδι μήλου');
  assert.equal(featuredName('DT096', 'en'), 'Pine and heather honey');
});
test('unknown product IDs do not borrow another product name', () => assert.equal(featuredName('DT999', 'el'), undefined));
