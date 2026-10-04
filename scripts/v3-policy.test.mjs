import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
const moduleUrl = new URL('../src/lib/product-media-policy.ts', import.meta.url);
const hasModule = existsSync(moduleUrl);
const policy = hasModule ? await import(moduleUrl) : {};
const variant = { src: '/media/v3/vinegar-abcd-800.webp', width:800, height:600 };
const art = { DT117: { sourceId:'DT117',kind:'illustration',width:1448,height:1086,variants:[variant] } };
const photo = { id:'rose', variants:[{src:'/photos/taha-2026/rose-400.webp',width:400,height:400},{src:'/photos/taha-2026/rose-1440.webp',width:1440,height:1440}] };
const resolve = (...args) => { assert.equal(typeof policy.resolveProductMedia, 'function', 'product media resolver is missing'); return policy.resolveProductMedia(...args); };

test('only explicit source IDs inherit generated illustrations', () => {
  assert.equal(resolve({sourceId:'DT117'},art,[]).kind,'illustration');
  assert.equal(resolve({sourceId:'DT118',category:'pantry'},art,[]).kind,'pending');
  assert.equal(resolve({sourceId:'DT118',image:'/products/hero-shop.jpg'},art,[]).src,null);
});
test('approved archive photo takes precedence and retains responsive sizes', () => {
  const media=resolve({sourceId:'DT117',info:{image:photo.variants[1].src}},art,[photo]);
  assert.equal(media.kind,'verified'); assert.deepEqual(media.variants,photo.variants);
});
test('assigning a generated path to info does not make it a verified photograph', () => {
  assert.equal(resolve({sourceId:'DT117',info:{image:variant.src}},art,[]).kind,'illustration');
  assert.equal(resolve({sourceId:'DT118',info:{image:variant.src}},art,[]).kind,'pending');
});
test('retired or external paths cannot bypass the image policy', () => {
  for (const image of ['/products/sku/gul-lokumu.jpg','/detox-gr/products/cream.jpg','https://tracking.example/image.jpg','//tracking.example/image.jpg','/photos/../../secret.png','/photos/%2e%2e/image.png']) {
    assert.equal(resolve({sourceId:'DT118',info:{image}},art,[]).kind,'pending',image);
  }
});
test('a vetted self-hosted product path is permitted without fabricated metadata', () => {
 const media=resolve({sourceId:'DT118',info:{image:'/photos/verified/label.png'}},art,[]);
 assert.equal(media.kind,'verified'); assert.equal(media.width,undefined); assert.equal(media.src,'/photos/verified/label.png');
});
test('base paths are applied once and absolute external navigation is not accepted', () => {
  assert.equal(typeof policy.assetUrl,'function');
  assert.equal(policy.assetUrl('/media/v3/a.webp','/detox-gr/'),'/detox-gr/media/v3/a.webp');
  assert.equal(policy.assetUrl('/detox-gr/media/v3/a.webp','/detox-gr/'),'/detox-gr/media/v3/a.webp');
  assert.equal(policy.assetUrl('/media/v3/a.webp','/'),'/media/v3/a.webp');
});
test('explicit archive references stay unverified and never map by category', () => {
 const reference = {DT222:{sourceId:'DT222',assetId:'rose'}};
 const media=resolve({sourceId:'DT222'},art,[photo],reference);
 assert.equal(media.kind,'reference'); assert.deepEqual(media.variants,photo.variants);
 assert.equal(resolve({sourceId:'DT223',category:'spice'},art,[photo],reference).kind,'pending');
 assert.equal(resolve({sourceId:'DT222'},art,[],reference).kind,'pending');
});
