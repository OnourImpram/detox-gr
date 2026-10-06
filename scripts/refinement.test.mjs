import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { discoverProducts, parseDiscoverySearch } from '../src/lib/discovery.ts';
import * as discovery from '../src/lib/discovery.ts';
const requestURL = new URL('../src/lib/selection-request.ts', import.meta.url);
const requests = existsSync(requestURL) ? await import(requestURL) : {};
const metaURL = new URL('./static-page-meta.mjs', import.meta.url);
const metadata = existsSync(metaURL) ? await import(metaURL) : {};
const products = [
 {slug:'sirkeli-sabun',sourceId:'DT1',name:'Sirkeli sabun',blurb:'Elma sirkesi ile bir seçki.',category:'soap',priceEur:8,houseNamed:false,image:null},
 {slug:'elma-sirkesi',sourceId:'DT2',name:'Elma sirkesi',blurb:'Kiler',category:'pantry',priceEur:7.5,houseNamed:true,image:'/test.webp'},
 {slug:'corekotu-yagi',sourceId:'DT3',name:'Çörekotu yağı',blurb:'Kiler',category:'oil',priceEur:9,houseNamed:true,image:'/test2.webp'},
 {slug:'gul-lokumu',sourceId:'DT4',name:'Gül lokumu',blurb:'İkram',category:'lokum',priceEur:null,houseNamed:false,image:null},
];
test('an exact product title precedes incidental description matches',()=>assert.equal(discoverProducts(products,{q:'elma sirkesi'})[0].sourceId,'DT2'));
test('discovery preserves validated layout and image filters',()=>{const s=parseDiscoverySearch({view:'list',media:'pictured'});assert.equal(s.view,'list');assert.equal(s.media,'pictured');});
test('untrusted discovery layout and media values return safe defaults',()=>{const s=parseDiscoverySearch({view:'<script>',media:'true'});assert.equal(s.view,'grid');assert.equal(s.media,'all');});
test('pictured filter does not silently include pending product media',()=>assert.deepEqual(discoverProducts(products,{media:'pictured'}).map(p=>p.sourceId),['DT2','DT3']));
test('common separated compound spelling finds the named product',()=>assert.deepEqual(discoverProducts(products,{q:'çörek otu yağı'}).map(p=>p.sourceId),['DT3']));
test('typo suggestions remain explicit and bounded',()=>{assert.equal(typeof discovery.suggestProducts,'function');assert.equal(discovery.suggestProducts(products,'sirkes')[0].sourceId,'DT2');assert.deepEqual(discovery.suggestProducts(products,'xyzxyzxyz'),[]);assert.deepEqual(discovery.suggestProducts(products,'a'),[]);});
test('requests identify per-kilogram quantities instead of ambiguous item counts',()=>{assert.equal(typeof requests.requestLine,'function');assert.equal(requests.requestLine({name:'Gül lokumu',sourceId:'DT002',qty:2,unit:'kg'}),'2 kg · Gül lokumu (DT002)');});
test('item quantities remain explicit without inventing package size',()=>{assert.equal(typeof requests.requestLine,'function');assert.equal(requests.requestLine({name:'Elma sirkesi',sourceId:'DT117',qty:2,unit:'şişe'}),'2 × Elma sirkesi (DT117)');});
test('unknown prices are counted as unknown, never added as zero-priced items',()=>{assert.equal(typeof requests.selectionSummary,'function');assert.deepEqual(requests.selectionSummary([{priceEur:7.5,qty:2},{priceEur:null,qty:1}]),{knownTotal:15,unknownLines:1,pricedLines:1});});
test('reference totals use minor units without fractional cent artifacts',()=>{assert.equal(typeof requests.selectionSummary,'function');assert.equal(requests.selectionSummary([{priceEur:.1,qty:3},{priceEur:.2,qty:1}]).knownTotal,.5);});
test('all twenty interface languages cover the new customer controls',()=>{const url=new URL('../src/data/refinement-copy.json',import.meta.url);assert.ok(existsSync(url));const p=JSON.parse(readFileSync(url,'utf8'));assert.equal(Object.keys(p).length,20);for(const [l,row]of Object.entries(p)){assert.deepEqual(Object.keys(row).sort(),Object.keys(p.tr).sort(),l);for(const v of Object.values(row))assert.ok(typeof v==='string'&&v.trim(),l);}});
test('static route metadata names the product rather than the home page',()=>{assert.equal(typeof metadata.describeRoute,'function');const m=metadata.describeRoute('/p/elma-sirkesi',new URL('..',import.meta.url).pathname);assert.match(m.title,/Elma sirkesi/);assert.match(m.image,/^https:/);});
test('static metadata escapes markup and keeps scripts and asset tags intact',()=>{assert.equal(typeof metadata.applyPageMeta,'function');const html='<html><head><title>old</title><script src="/assets/app.js"></script></head><body></body></html>';const out=metadata.applyPageMeta(html,{title:'X</title><script>alert(1)</script>',description:'"test"',image:'https://example.test/a.jpg',url:'https://example.test/x'});assert.ok(out.includes('X&lt;/title&gt;'));assert.ok(!out.includes('<script>alert(1)'));assert.ok(out.includes('<script src="/assets/app.js"></script>'));assert.match(out,/noindex/);});
test('unpriced request lines cannot bypass quantity validation',()=>{for(const qty of [0,-1,1.5,21,NaN,Infinity])assert.throws(()=>requests.selectionSummary([{priceEur:null,qty}]));});
test('request labels cannot inject additional lines or invalid identifiers',()=>{assert.equal(requests.requestLine({name:'Gül\nlokumu',sourceId:'DT002',qty:1,unit:'kg'}),'1 kg · Gül lokumu (DT002)');assert.throws(()=>requests.requestLine({name:'Test',sourceId:'DT002\nTEST',qty:1,unit:'kg'}));assert.throws(()=>requests.requestLine({name:'Test',sourceId:'DT002',qty:0,unit:'kg'}));});
test('metadata rewriting is idempotent and preserves a real unknown-route title',()=>{assert.equal(typeof metadata.applyPageMeta,'function');const m={title:'Yeni',description:'A & B',image:'https://example.test/image.jpg',url:'https://example.test/x'};const html='<head><title>Eski</title><meta name="description" content="old"/><meta property="og:title" content="old" /></head>';const once=metadata.applyPageMeta(html,m);assert.equal(metadata.applyPageMeta(once,m),once);assert.equal((once.match(/<title>/g)||[]).length,1);assert.match(metadata.describeRoute('/not-a-real-route',new URL('..',import.meta.url).pathname).title,/404/);});
