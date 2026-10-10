import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';
const live=Boolean(process.env.SITE_URL);
const base=(process.env.SITE_URL ?? 'http://127.0.0.1:8106/detox-gr').replace(/\/$/,'');
const out=live?'qa-live':'qa-evidence';mkdirSync(out,{recursive:true});
const manifest=JSON.parse(readFileSync('src/data/aktar-hero.json','utf8'));
const report={ok:false,live,base,hero:manifest.id,observations:[],checks:[],assets:[],errors:[],offlineFontRequests:[]};
const server=live?null:spawn(process.execPath,['scripts/serve-storefront-preview.mjs'],{env:{...process.env,QA_PORT:'8106'},stdio:'ignore'});
let browser,page;
async function inspect(label){const state=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,h1:document.querySelector('main h1')?.innerText,images:[...document.images].filter(i=>i.complete&&!i.naturalWidth&&i.getBoundingClientRect().width>0).map(i=>i.currentSrc)}));report.observations.push({label,...state});assert.ok(state.h1);assert.ok(state.scrollWidth<=state.width+1,`${label}: overflow`);assert.deepEqual(state.images,[]);}
async function visit(path){const res=await page.goto(base+path,{waitUntil:'networkidle'});assert.equal(res.status(),200);await page.locator('main h1').waitFor();}
try{
 if(!live)for(let i=0;i<80;i++){try{if((await fetch(base+'/')).ok)break;}catch{/* Local preview process may still be starting. */}await delay(100);}
 if(live){assert.ok(process.env.EXPECTED_COMMIT);report.build=await(await fetch(base+'/build.json?hero='+Date.now())).json();assert.equal(report.build.commit,process.env.EXPECTED_COMMIT);assert.equal(report.build.paymentActivated,false);}
 browser=await chromium.launch({headless:true,args:['--no-sandbox'],...(process.env.BROWSER_EXECUTABLE_PATH?{executablePath:process.env.BROWSER_EXECUTABLE_PATH}:{})});
 page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error'){const url=m.location().url;if(process.env.OFFLINE_FONTS==='1'&&/fonts\.(googleapis|gstatic)\.com/.test(url))report.offlineFontRequests.push(url);else report.errors.push(m.text()+' '+url);}});
 if(process.env.OFFLINE_FONTS==='1')await page.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:'/* offline font fallback for local evidence only */'}));
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:900});await visit('/?lang=tr');
  const photo=page.locator('[data-hero-id="'+manifest.id+'"] img');await photo.evaluate(i=>i.decode());
  assert.ok((await photo.getAttribute('alt')).includes('Elma'));assert.equal(await photo.evaluate(i=>getComputedStyle(i).objectFit),'contain');
  assert.equal(await page.locator('.atelier-specimen__controls button').count(),4);await inspect('main-'+width);
  if(width===1440)await page.locator('.atelier-hero').screenshot({path:out+'/aktar-main-desktop.png'});
  await visit('/yavas-dukkan/');const hero=page.locator('.hero');await page.locator('.hero-img').evaluate(i=>i.decode());
  assert.equal(await hero.getAttribute('data-scene-key'),'hero-aktar');assert.match(await page.locator('h1').innerText(),/Dükkâna\s+buyurun/);
  assert.ok((await page.locator('.hero-img').evaluate(i=>i.currentSrc)).includes('/media/hero/detoks-aktar-sirke-20261010-'));
  assert.ok((await page.locator('.hero-place').innerText()).includes('Temsili kompozisyon'));await inspect('yavas-'+width);
  if([390,1440].includes(width))await page.screenshot({path:out+`/aktar-yavas-${width}.png`,fullPage:false});
 }
 await page.locator('[data-scene="1"]').click();await page.locator('.hero-img').evaluate(i=>i.decode());assert.equal(await page.locator('.hero-img').getAttribute('srcset'),null);
 await page.locator('[data-scene="0"]').click();await page.locator('.hero-img').evaluate(i=>i.decode());assert.ok(await page.locator('.hero-img').getAttribute('srcset'));report.checks.push('Hero scene changes replace srcset and restore the approved composite');
 await page.locator('.hero-actions a').first().click();await page.waitForFunction(()=>location.hash.startsWith('#/raflar')&&document.querySelectorAll('.product-card').length===14);assert.equal(await page.locator('.product-card').count(),14);report.checks.push('Approved 14-product prototype remains an explicit separate preview');
 await page.locator('.product-card [data-add]').first().click();assert.equal(await page.locator('.list-count').innerText(),'1');report.checks.push('Preview local list interaction still works');
 for(const variant of manifest.variants){const res=await fetch(base+variant.src);assert.equal(res.status,200);const body=Buffer.from(await res.arrayBuffer());assert.equal(body.length,variant.bytes);assert.equal(createHash('sha256').update(body).digest('hex'),variant.sha256);report.assets.push(variant.src);}
 assert.deepEqual(report.errors,[]);report.ok=true;console.log(`Approved hero integration passed: ${report.observations.length} layouts, ${report.assets.length} SHA256-verified assets.`);
}catch(e){report.failure=String(e);console.error(e);process.exitCode=1;await page?.screenshot({path:out+'/aktar-failure.png',fullPage:true}).catch(()=>{});}
finally{writeFileSync(out+'/aktar-hero-browser.json',JSON.stringify(report,null,2));await browser?.close();server?.kill();}
