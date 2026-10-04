import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const path=resolve(root,'src/data/brand-copy.json');
test('a complete editorial source replaces scattered page-level copy',()=>assert.ok(existsSync(path)));
test('all new editorial keys exist in twenty locales, with no hidden fallback',()=>{
 const content=JSON.parse(readFileSync(path,'utf8')); const locales=['tr','el','en','de','fr','it','es','nl','pl','no','bg','ro','sv','da','fi','pt','hu','cs','hr','sk'];
 assert.deepEqual(Object.keys(content).sort(),locales.sort());
 const keys=Object.keys(content.tr).sort();assert.ok(keys.length>75);
 for(const locale of locales){
  assert.deepEqual(Object.keys(content[locale]).sort(),keys,locale);
  for(const key of keys){
   const s=content[locale][key];assert.equal(typeof s,'string',locale+'.'+key);assert.ok(s.trim(),locale+'.'+key);
   assert.doesNotMatch(s,/\[(TAHA|TODO|DANIŞMAN)|Lorem ipsum|INSERT HERE/);
   assert.deepEqual((s.match(/\{\w+\}/g)||[]).sort(),(content.tr[key].match(/\{\w+\}/g)||[]).sort(),key);
  }
 }
});
test('new core narratives are distinct authored locale texts, not English duplicates',()=>{
 const c=JSON.parse(readFileSync(path,'utf8'));
 for(const key of ['hero.title','story.body1','delivery.body','gift.body','trade.body','legal.body']) assert.equal(new Set(Object.values(c).map(v=>v[key])).size,20,key);
});
test('the editorial lookup fails visibly for unknown keys',async()=>{
 const {interpolateBrand}=await import('../src/lib/brand-format.ts');
 assert.equal(interpolateBrand('Showing {n}',{n:24}),'Showing 24');
 assert.throws(()=>interpolateBrand('Showing {n}',{}),/Missing/);
});
test('inquiry text does not turn into a fabricated order or persist personal data',async()=>{
 const {buildInquiry}=await import('../src/lib/inquiry.ts');
 const result=buildInquiry({heading:'Gift enquiry',country:'DE',concept:'Coffee table',budget:'40',note:'No nuts\nPlease confirm ingredients'},'https://wa.me/306945827275');
 assert.equal(new URL(result).hostname,'wa.me');
 const text=new URL(result).searchParams.get('text');
 assert.ok(text.includes('DE')&&text.includes('Coffee table')&&text.includes('No nuts'));
 assert.ok(!text.includes('paid')&&!text.includes('confirmed order'));
 assert.throws(()=>buildInquiry({heading:'x',country:'DE'},'https://evil.test'),/WhatsApp/);
});
