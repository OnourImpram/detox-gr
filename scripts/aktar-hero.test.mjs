import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const read = path => existsSync(resolve(root,path)) ? readFileSync(resolve(root,path),'utf8') : '';
const hero = () => JSON.parse(read('src/data/aktar-hero.json') || '{}');
test('the approved vinegar and herbs scene is explicitly illustrative, not a SKU or shop photo',()=>{
 const data=hero();assert.equal(data.id,'aktar-vinegar-20261010');assert.equal(data.kind,'illustration');assert.equal(data.userApproved,true);
 assert.equal(data.isActualStorePhoto,false);assert.equal(data.isVerifiedProductPhoto,false);assert.ok(data.sourceSha256?.length===64);assert.equal(data.sourceId,undefined);
});
test('every responsive hero image has registered dimensions and checksum',()=>{
 const data=hero();assert.equal(data.variants?.length,4);
 for(const v of data.variants){const buffer=readFileSync(resolve(root,'public'+v.src));assert.equal(buffer.length,v.bytes);assert.equal(createHash('sha256').update(buffer).digest('hex'),v.sha256);assert.ok(Math.abs(v.width/v.height-1672/941)<.01);assert.ok(v.width<=1672);}
});
test('live homepage leads with the approved scene, retaining all three real archive alternatives',()=>{
 const code=read('src/components/atelier-hero.tsx');assert.match(code,/AktarHeroImage/);assert.match(code,/selected === 0/);assert.match(code,/PHOTO.hero/);assert.match(code,/PHOTO.rose/);assert.match(code,/PHOTO.star/);assert.match(code,/mediaCopy/);
 assert.doesNotMatch(code,/setInterval|autoPlay|setTimeout/);
});
test('the chosen Yavas Dukkan prototype is published separately without replacing the full catalogue',()=>{
 const html=read('public/yavas-dukkan/index.html');assert.match(html,/hero-aktar/);assert.match(html,/Dükkâna/);assert.match(html,/buyurun/);assert.match(html,/Temsili kompozisyon/);assert.match(html,/14 ürün/);assert.match(html,/08\.4/);assert.doesNotMatch(html,/Bir çay<\/span>/);
 assert.ok(existsSync(resolve(root,'src/routes/shop.index.tsx')));assert.equal(JSON.parse(read('src/data/commerce-config.json')).mode,'preview');
});
