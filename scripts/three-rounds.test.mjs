import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { resolveProductMedia } from '../src/lib/product-media-policy.ts';
const root = resolve(import.meta.dirname,'..');
const file = path => resolve(root,path);
const read = path => JSON.parse(readFileSync(file(path),'utf8'));
const manifest = existsSync(file('src/data/generated-scenes.json')) ? read('src/data/generated-scenes.json') : {scenes:[]};
const scenes = manifest.scenes;
const policyUrl = new URL('../src/lib/generated-scenes-policy.ts',import.meta.url);
const policy = existsSync(policyUrl) ? await import(policyUrl) : {};
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

test('all thirty distinct images from the three user requested rounds are registered',()=>{
 assert.equal(scenes.length,30);
 assert.equal(new Set(scenes.map(s=>s.id)).size,30);
 assert.equal(new Set(scenes.map(s=>s.originalSha256)).size,30);
 for (const round of [1,2,3]) assert.equal(scenes.filter(s=>s.round===round).length,10);
});
test('every new source has responsive WebP files with correct bytes and hashes',()=>{
 assert.equal(scenes.length,30);
 for(const scene of scenes){
  assert.equal(scene.kind,'illustration'); assert.equal(scene.verifiedProductPhoto,false);
  assert.match(scene.originalSha256,/^[a-f0-9]{64}$/); assert.equal(scene.width/scene.height,4/3);
  assert.deepEqual(scene.variants.map(v=>v.width),[400,800,1200,1448]);
  for(const v of scene.variants){
   assert.match(v.src,/^\/media\/generated\/[a-z0-9-]+\.webp$/);
   const bytes=readFileSync(file(`public${v.src}`));
   assert.equal(bytes.subarray(0,4).toString(),'RIFF'); assert.equal(bytes.subarray(8,12).toString(),'WEBP');
   assert.equal(bytes.length,v.bytes);assert.equal(sha(bytes),v.sha256);
  }
 }
});
test('every assigned source ID exists, is not held, and has a unique primary scene',()=>{
 const rows=read('src/data/catalog-vitrin.json');const primary=new Set();
 for(const scene of scenes){
  for(const id of scene.sourceIds){const p=rows.find(p=>p.source_record_id===id);assert.ok(p,id);assert.notEqual(p.editorial_status,'İNCELEME ÖNCESİ YAYIN YOK');}
  for(const id of scene.primaryFor){assert.ok(scene.sourceIds.includes(id));assert.ok(!primary.has(id));primary.add(id);}
 }
 assert.ok(primary.size>=15);
});
test('unconfirmed pink salt, tinted rose liquid and generic dates do not impersonate exact SKUs',()=>{
 for(const id of ['R2-08','R3-02','R1-06','R2-05']) {
  const scene=scenes.find(s=>s.id===id);assert.ok(scene,id);assert.deepEqual(scene.sourceIds,[]);assert.equal(scene.usage,'editorial');
 }
 assert.deepEqual(scenes.find(s=>s.id==='R1-09')?.primaryFor,['DT131']);
});
test('primary selection and alternatives are deterministic and source-ID specific',()=>{
 assert.equal(typeof policy.primaryIllustrations,'function');assert.equal(typeof policy.scenesForProduct,'function');
 const entries=policy.primaryIllustrations(scenes);
 assert.equal(entries.DT117?.sourceId,'DT117');assert.equal(entries.DT117?.kind,'illustration');
 assert.equal(policy.scenesForProduct(scenes,'DT001').length,2);
 assert.equal(policy.scenesForProduct(scenes,'DT021').length,2);
 assert.equal(policy.scenesForProduct(scenes,'DT049').length,0);
 assert.equal(policy.scenesForProduct(scenes,'DT999').length,0);
 assert.equal(policy.scenesForProduct(scenes,'DT001')[0].id,'R3-03');
});
test('unselected generated media cannot be elevated to a verified photograph',()=>{
 const media=resolveProductMedia({sourceId:'DT049',info:{image:'/media/generated/rose-water-123-800.webp'}},{},[]);
 assert.equal(media.kind,'pending');
});
test('gallery copy has exact key parity in all twenty supported locales',()=>{
 assert.ok(existsSync(file('src/data/scene-copy.json')));
 const data=read('src/data/scene-copy.json');assert.equal(Object.keys(data).length,20);
 const keys=Object.keys(data.tr).sort();for(const row of Object.values(data)){assert.deepEqual(Object.keys(row).sort(),keys);assert.ok(Object.values(row).every(s=>typeof s==='string'&&s.trim()));}
});
test('original photographs and approval gates remain untouched',()=>{
 const archive=read('docs/v3/ARCHIVE_CHECKSUMS.json');assert.equal(Object.keys(archive).length,453);
 for(const [path,digest] of Object.entries(archive))assert.equal(sha(readFileSync(file(path))),digest);
 assert.equal(read('src/data/commerce-config.json').mode,'preview');
 assert.equal(Object.keys(read('src/data/photo-approved.json')).filter(k=>/^DT\d+$/.test(k)).length,0);
});
