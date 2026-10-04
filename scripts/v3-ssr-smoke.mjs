import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
const origin=process.env.SSR_ORIGIN || 'http://127.0.0.1:8095';
const copy=JSON.parse(readFileSync('src/data/brand-copy.json','utf8'));
const observations=[];
for(const locale of Object.keys(copy)) {
 const response=await fetch(`${origin}/?lang=${locale}`),html=await response.text();
 assert.equal(response.status,200,locale);assert.ok(html.includes(`<html lang="${locale==='no'?'nb':locale}"`),locale);
 assert.ok(html.includes(copy[locale]['hero.title']),`${locale}: translated SSR heading missing`);
 assert.ok(!html.includes('Editorial pack not loaded'),locale);assert.ok(html.includes('noindex'));
 assert.ok(!/src="[^"]*\/(?:products|__grok)\//.test(html),`${locale}: obsolete SSR media`);
 observations.push({locale,status:response.status,bytes:Buffer.byteLength(html)});
}
for(const path of ['/p/no-such-product','/shop/no-such-category','/notlar/no-such-note']) {
 const response=await fetch(`${origin}${path}?lang=en`);assert.equal(response.status,404,path);
 observations.push({path,status:response.status});
}
mkdirSync('qa-evidence',{recursive:true});writeFileSync('qa-evidence/v3-ssr.json',JSON.stringify({ok:true,observations},null,2));
console.log(`SSR smoke passed: ${observations.length} requests.`);
