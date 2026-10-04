import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const get = p => JSON.parse(readFileSync(resolve(root,p),'utf8'));
test('the supplied archive has a versioned photo register', () => assert.ok(existsSync(resolve(root,'src/data/photo-archive.json'))));
test('all 151 original images are accounted for with unique source hashes', () => {
 const {photos} = get('src/data/photo-archive.json');
 assert.equal(photos.length,151);
 for(const field of ['id','original','sha256']) assert.equal(new Set(photos.map(p=>p[field])).size,151,field);
 for(const p of photos){assert.match(p.original,/^MF8A\d{4}\.JPG$/);assert.match(p.sha256,/^[a-f0-9]{64}$/);assert.equal(p.productVerified,false);}
});
test('every derived photo path is safe, available and has a width and height', () => {
 for(const p of get('src/data/photo-archive.json').photos){
  assert.match(p.id,/^[a-z0-9-]+$/);
  assert.ok(['seeds','herbs','spices','blends','powders','flowers','bark'].includes(p.group));
  assert.equal(p.variants.length,3);
  for(const v of p.variants){ assert.match(v.src,/^\/photos\/taha-2026\/[a-z0-9-]+\.webp$/);assert.ok(v.width>0&&v.height>0);assert.ok(existsSync(resolve(root,'public'+v.src)),v.src);assert.ok(v.bytes>0&&v.bytes<450000); }
 }
});
test('visual subject recognition does not silently become product approval',()=>assert.deepEqual(get('src/data/photo-approved.json'),{}));
test('photo approval cannot be inferred from a candidate or description',async()=>{
 const {isApprovedPhoto}=await import('../src/lib/photo-policy.ts');
 assert.equal(isApprovedPhoto({assetId:'a',candidate:'DT117'}),false);
 assert.equal(isApprovedPhoto({assetId:'a',approved:true}),false);
 assert.equal(isApprovedPhoto({assetId:'a',approved:true,reviewedBy:'Taha',reviewedAt:'2026-10-04',sourceId:'DT117'}),true);
});
test('photo approvals reject impossible calendar dates and unsafe asset names',async()=>{
 const {isApprovedPhoto}=await import('../src/lib/photo-policy.ts');
 const good={assetId:'gul-tomurcuklari-mf8a6417',sourceId:'DT222',approved:true,reviewedBy:'Taha',reviewedAt:'2026-10-04'};
 assert.equal(isApprovedPhoto({...good,reviewedAt:'2026-02-30'}),false);
 assert.equal(isApprovedPhoto({...good,assetId:'../../image'}),false);
});
test('only an approved, source-matching, known asset can become a product photograph',async()=>{
 const {approvedPhotoPath}=await import('../src/lib/photo-policy.ts');
 const photo={id:'rose-photo',variants:[{src:'/photos/taha-2026/rose-photo-1440.webp'}]};
 const approval={assetId:'rose-photo',sourceId:'DT222',approved:true,reviewedBy:'Taha',reviewedAt:'2026-10-04'};
 assert.equal(approvedPhotoPath({},'DT222',[photo]),undefined);
 assert.equal(approvedPhotoPath({DT222:{...approval,sourceId:'DT223'}},'DT222',[photo]),undefined);
 assert.equal(approvedPhotoPath({DT222:approval},'DT222',[]),undefined);
 assert.equal(approvedPhotoPath({DT222:approval},'DT222',[photo]),photo.variants[0].src);
});
