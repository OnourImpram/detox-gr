import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
const url = new URL('../src/lib/content-locale.ts', import.meta.url);
const api = existsSync(url) ? await import(url) : {};

test('visible copy uses the locale of the completed loader, not a pending URL', () => {
  assert.equal(typeof api.useContentLocale, 'function', 'committed content locale context is missing');
  const Probe = () => React.createElement('span', null, api.useContentLocale());
  for (const locale of ['tr', 'el', 'en', 'de', 'fi']) {
    const html = renderToStaticMarkup(React.createElement(api.ContentLocale.Provider, { value: locale }, React.createElement(Probe)));
    assert.equal(html, `<span>${locale}</span>`);
  }
});

test('document locale resolves only validated completed-loader data', () => {
  assert.equal(typeof api.localeFromLoaderData, 'function');
  for (const locale of ['tr', 'el', 'en']) assert.equal(api.localeFromLoaderData({ locale }), locale);
  for (const data of [null, undefined, {}, [], { locale: 'xx' }, { locale: 2 }]) assert.equal(api.localeFromLoaderData(data), 'tr');
});

test('the application binds its complete content subtree to serialized locale data', () => {
  const code = readFileSync(new URL('../src/routes/__root.tsx', import.meta.url), 'utf8');
  assert.match(code, /<ContentLocale\.Provider value=\{data\.locale\}>/);
  assert.match(code, /localeFromLoaderData/);
  assert.doesNotMatch(readFileSync(new URL('../src/lib/use-locale.ts', import.meta.url), 'utf8'), /s\.location\.search/);
});
