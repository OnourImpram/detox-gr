import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import assert from 'node:assert/strict';
const origin = 'http://127.0.0.1:8092';
const base = `${origin}/detox-gr`;
const out = 'qa-evidence';
const registry = JSON.parse(readFileSync('src/data/product-media-v3.json','utf8'));
const disclosures = JSON.parse(readFileSync('src/data/media-copy.json','utf8'));
const report = { version:'3.0.0', ok:false, observations:[], assertions:[], requests:[], errors:[], sources:[], variantsVerified:0 };
mkdirSync(out,{recursive:true});
const server=spawn(process.execPath,['scripts/serve-storefront-preview.mjs'],{stdio:'ignore'});
let browser,page;
async function load(path) { await page.goto(`${base}${path}`,{waitUntil:'networkidle'}); }
async function layout(name) {
 const state=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
  h1:document.querySelector('h1')?.textContent,lang:document.documentElement.lang,
  broken:[...document.images].filter(image=>image.complete&&image.naturalWidth===0).map(image=>image.currentSrc),
  overflow:[...document.body.querySelectorAll('*')].map(e=>({tag:e.tagName,cls:typeof e.className==='string'?e.className:'',right:e.getBoundingClientRect().right,text:e.textContent?.slice(0,90)})).filter(e=>e.right>innerWidth+1).slice(0,12)
 }));
 report.observations.push({name,...state});
 assert.ok(state.h1,name);
 assert.ok(state.scrollWidth<=state.width+1,`${name}: horizontal overflow ${state.scrollWidth}/${state.width}`);
 assert.equal(state.broken.length,0,`${name}: broken image`);
}
async function screenshot(name,full=true){
 await page.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=700){scrollTo(0,y);await new Promise(r=>setTimeout(r,15));}await document.fonts.ready;scrollTo(0,0);});
 await page.screenshot({path:`${out}/${name}.png`,fullPage:full});
}
async function inspectProduct(id,kind){
 await load(`/shop?lang=tr&q=${id}`);
 const card=page.locator(`[data-product-id="${id}"]`);
 assert.equal(await card.count(),1);
 assert.equal(await card.locator('[data-media-kind]').getAttribute('data-media-kind'),kind);
 await card.locator('a').click();await page.waitForLoadState('networkidle');
 const main=page.locator(`.v3-pdp-media[data-media-for="${id}"]`);
 await main.waitFor();
 assert.equal(await main.getAttribute('data-media-kind'),kind);
 if(kind!=='pending') {
  const image=await main.locator('img').evaluate(el=>({src:el.currentSrc,width:el.naturalWidth,height:el.naturalHeight,srcset:el.srcset}));
  report.sources.push({id,kind,...image});assert.ok(image.width>0);
  if(kind==='illustration')assert.ok(image.src.includes('/media/v3/'));
  else assert.ok(image.src.includes('/photos/taha-2026/'));
 } else {assert.equal(await main.locator('img').count(),0);assert.ok(await main.getByRole('img').isVisible());}
 report.assertions.push(`${id} uses ${kind} in both catalogue and product page`);
 return page.url();
}
try {
 for(let i=0;i<80;i++){try{if((await fetch(`${base}/`)).ok)break;}catch{/* Controlled preview boot. */}await delay(100);}
 browser=await chromium.launch({headless:true,args:['--no-sandbox'],...(process.env.BROWSER_EXECUTABLE_PATH?{executablePath:process.env.BROWSER_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({reducedMotion:'reduce'});
 page=await context.newPage();
 page.on('pageerror',error=>report.errors.push(error.message));
 page.on('console',message=>{if(message.type()==='error')report.errors.push(message.text());});
 page.on('request',request=>report.requests.push(request.url()));
 await page.route('**/*',route=>{
  const url=route.request().url();if(url.startsWith(origin)||url.startsWith('data:'))return route.continue();
  report.errors.push(`Unexpected external request ${url}`);return route.abort();
 });
 for(const locale of ['tr','el','en'])for(const width of [320,390,768,1024,1440]){
  await page.setViewportSize({width,height:950});await load(`/?lang=${locale}`);await layout(`home-${locale}-${width}`);
  for(const id of ['DT117','DT101','DT157','DT002'])assert.equal(await page.locator(`[data-product-id="${id}"] [data-media-kind]`).getAttribute('data-media-kind'),'illustration');
 }
 await page.setViewportSize({width:1440,height:1050});await load('/?lang=tr');
 const priceY=await page.locator('.ed-featured .dt-product-card__price').evaluateAll(elements=>elements.map(el=>el.getBoundingClientRect().top));
 assert.ok(Math.max(...priceY)-Math.min(...priceY)<=1,`Prices not aligned: ${priceY}`);
 report.assertions.push('Featured card prices align despite different net quantities');
 const order=await page.evaluate(()=>({products:document.querySelector('.ed-featured').getBoundingClientRect().top,shelves:document.querySelector('.ed-shelves').getBoundingClientRect().top}));
 assert.ok(order.products<order.shelves);report.assertions.push('Products precede extended two-shelf narrative');
 await screenshot('v3-home-desktop');await screenshot('v3-home-desktop-fold',false);
 await page.locator('.ed-featured').screenshot({path:`${out}/v3-featured-desktop.png`});
 await page.locator('#desktop-search').fill('DT117');
 await Promise.all([page.waitForURL(url => url.pathname.endsWith('/shop') && url.searchParams.get('q') === 'DT117'), page.locator('#desktop-search').press('Enter')]);
 await page.locator('[data-testid=product-explorer]').waitFor();
 await page.waitForFunction(() => document.querySelectorAll('[data-testid=product-grid] [data-product-id]').length === 1);
 assert.equal(await page.locator('[data-product-id]').count(),1);assert.equal(new URL(page.url()).searchParams.get('q'),'DT117');
 report.assertions.push('Header search submits an actual catalogue query');
 const urls={};for(const id of Object.keys(registry.products))urls[id]=await inspectProduct(id,'illustration');
 await screenshot('v3-product-desktop');
 const pendingUrl=await inspectProduct('DT049','pending');await screenshot('v3-product-pending-desktop');
 await inspectProduct('DT239','reference');await screenshot('v3-product-reference-desktop');
 assert.ok(await page.getByText(disclosures.tr.referenceDisclosure,{exact:true}).isVisible());
 await page.locator('.dt-pdp__actions > button').click();await load('/sepet?lang=tr');
 assert.equal(await page.locator('.dt-cart-line [data-media-kind="reference"]').count(),1);
 await load(urls.DT117.replace(base,''));await page.locator('.dt-pdp__actions > button').click();await load('/sepet?lang=tr');
 assert.equal(await page.locator('.dt-cart-line [data-media-kind="illustration"]').count(),1);
 await screenshot('v3-list-desktop');
 await load('/shop?lang=tr&page=100');
 assert.equal(await page.locator('[data-product-id]').count(),226);
 const kinds=await page.locator('[data-product-id] [data-media-kind]').evaluateAll(elements=>elements.reduce((counts,el)=>{const kind=el.dataset.mediaKind;counts[kind]=(counts[kind]||0)+1;return counts;},{}));
 assert.deepEqual(kinds,{illustration:4,pending:218,reference:4});
 report.assertions.push('All 226 product media records classified: 4 illustrations, 4 archive references, 218 explicit pending states');
 report.catalogueMedia=kinds;
 await load('/shop?lang=el&page=2&sort=price-asc');
 const target=page.locator('[data-product-id] a').nth(8);await target.scrollIntoViewIfNeeded();
 const before=await page.evaluate(()=>scrollY);await target.click();await page.locator('.dt-pdp').waitFor();
 await page.goBack({waitUntil:'networkidle'});await page.waitForTimeout(400);
 assert.equal(new URL(page.url()).searchParams.get('page'),'2');assert.equal(new URL(page.url()).searchParams.get('sort'),'price-asc');
 const after=await page.evaluate(()=>scrollY);assert.ok(Math.abs(before-after)<4,`Scroll not restored ${before}/${after}`);
 report.assertions.push(`Catalogue back navigation retains filters and scroll position ${before}/${after}`);
 await load('/shop?lang=tr');await screenshot('v3-catalogue-desktop');
 for(const locale of Object.keys(disclosures)){
  await page.setViewportSize({width:320,height:900});
  await load(`/shop?lang=${locale}`);await layout(`catalogue-${locale}-320`);
  await load(`${pendingUrl.replace(base,'').split('?')[0]}?lang=${locale}`);await layout(`pending-${locale}-320`);
  assert.ok(await page.locator('.v3-pdp-media').getByText(disclosures[locale].pending,{exact:true}).first().isVisible());
 }
 await page.setViewportSize({width:390,height:844});await load('/?lang=el');await screenshot('v3-home-el-mobile');
 await load(`${urls.DT117.replace(base,'').split('?')[0]}?lang=tr`);await screenshot('v3-product-mobile');
 await load('/sepet?lang=tr');await layout('list-tr-mobile');await screenshot('v3-list-mobile');
 await load('/raf?lang=tr');await layout('photo-archive-mobile');await screenshot('v3-archive-mobile');
 for(const media of Object.values(registry.products))for(const variant of media.variants){
  const response=await fetch(`${base}${variant.src}`);assert.equal(response.status,200);
  assert.match(response.headers.get('content-type'),/image\/webp/);
  const bytes=Buffer.from(await response.arrayBuffer());assert.equal(bytes.length,variant.bytes);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),variant.sha256);report.variantsVerified++;
 }
 const manifestResponse=await fetch(`${base}/manifest.webmanifest`);const manifest=await manifestResponse.json();
 for(const icon of manifest.icons){const response=await fetch(new URL(icon.src,base));assert.equal(response.status,200);}
 assert.equal((await (await fetch(`${base}/version.json`)).json()).version,'3.0.0');
 assert.equal(report.requests.filter(url=>/\/(?:products|__grok)\//.test(url)).length,0);
 assert.equal(report.errors.length,0,report.errors.join('\n'));
 report.assertions.push('No obsolete synthetic or Grok icon URL requested');
 // Fault injection is isolated and reported separately, never hidden from normal checks.
 const fault=await context.newPage();const faults=[];fault.on('console',m=>{if(m.type()==='error')faults.push(m.text());});
 await fault.route('**/media/v3/**',route=>route.fulfill({status:200,contentType:'image/webp',body:'invalid image fixture'}));
 await fault.goto(urls.DT117,{waitUntil:'networkidle'});
 assert.equal(await fault.locator('.v3-pdp-media').getAttribute('data-media-kind'),'pending');
 assert.equal(await fault.locator('.v3-pdp-media img').count(),0);
 report.faultInjection={expectedCorruptImage:true,console:faults,result:'explicit pending state, no retry loop'};
 await fault.close();
 report.ok=true;
 console.log(`v3 passed. ${report.observations.length} viewport checks, ${report.variantsVerified} image hash checks and ${report.assertions.length} interaction/policy checks.`);
} catch(error){
 report.failure=String(error);console.error(error);process.exitCode=1;
 await page?.screenshot({path:`${out}/v3-failure.png`,fullPage:true}).catch(()=>{});
} finally{
 writeFileSync(`${out}/v3-browser.json`,JSON.stringify(report,null,2));
 await browser?.close();server.kill();
}
