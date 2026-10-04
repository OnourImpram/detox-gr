import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const read=path=>readFileSync(resolve(root,path),'utf8');
test('brand runtime does not import the entire twenty-language master',()=>{
 assert.doesNotMatch(read('src/lib/brand-copy.ts'),/from ['"]@\/data\/brand-copy.json/);
 assert.match(read('src/lib/brand-copy.ts'),/loadBrandPack/);
});
test('every lazy brand pack exactly matches its source locale',()=>{
 const source=JSON.parse(read('src/data/brand-copy.json'));
 for(const [locale,pack] of Object.entries(source)){
  assert.ok(existsSync(resolve(root,`src/data/brand/${locale}.json`)),locale);
  assert.deepEqual(JSON.parse(read(`src/data/brand/${locale}.json`)),pack);
 }
});
test('root awaits and serializes the selected brand pack',()=>{
 const code=read('src/routes/__root.tsx');
 assert.match(code,/loadBrandPack\(locale\)/);
 assert.match(code,/registerBrandPack\(data.locale, data.brand\)/);
});
