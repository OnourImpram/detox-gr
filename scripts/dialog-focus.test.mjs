import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
const url = new URL('../src/lib/dialog-focus.ts', import.meta.url);
const focus = existsSync(url) ? await import(url) : {};
test('modal tab order wraps forward and backward instead of leaving the dialog', () => {
  assert.equal(typeof focus.modalTabBoundary, 'function');
  assert.equal(focus.modalTabBoundary(3, 4, false), 0);
  assert.equal(focus.modalTabBoundary(0, 4, true), 3);
  assert.equal(focus.modalTabBoundary(-1, 4, false), 0);
  assert.equal(focus.modalTabBoundary(-1, 4, true), 3);
});
test('ordinary middle-of-dialog navigation and empty groups are not redirected', () => {
  assert.equal(typeof focus.modalTabBoundary, 'function');
  assert.equal(focus.modalTabBoundary(1, 4, false), null);
  assert.equal(focus.modalTabBoundary(2, 4, true), null);
  assert.equal(focus.modalTabBoundary(0, 0, false), null);
});
