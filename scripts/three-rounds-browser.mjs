import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';

const scenes=JSON.parse(readFileSync('src/data/generated-scenes.json','utf8')).scenes;
const copy=JSON.parse(readFileSync('src/data/scene-copy.json','utf8'));
const version=JSON.parse(readFileSync('src/data/release.json','utf8')).version;
const live=!!process.env.SITE_URL;
const base=(process.env.SITE_URL ?? 'http://127.0.0.1:8097/detox-gr').replace(/\/$/,'');
const out=live?'qa-live':'qa-evidence';mkdirSync(out,{recursive:true});
const report={ok:false,version,base,live,checks:[],observations:[],renderedScenes:[],verifiedFiles:[],errors:[]};
let browser,page;
const server=live?null:spawn(process.execPath,['scripts/serve-storefront-preview.mjs'],{env:{...process.env,QA_PORT:'8097'},stdio:'ignore'});
const url=path=>`${base}${path}`;
async function get(path){
 // Retry only transient CDN/server responses, never malformed content or a failed hash.
 let response;
 for(let i=0;i<3;i++){response=await fetch(url(path),{cache:'no-store'});if(response.status<500)break;await delay(1500);}
 assert.equal(response.status,200,path);return response;
}
async function visit(path){const response=await page.goto(url(path),{waitUntil:'networkidle'});assert.equal(response?.status(),200,`Document ${path}`);await page.locator('h1').waitFor();}
async function inspect(label){
 const state=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,lang:document.documentElement.lang,
  h1:document.querySelector('h1')?.textContent,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.currentSrc),
  overflow:[...document.querySelectorAll('main *')].filter(el=>el.getBoundingClientRect().right>innerWidth+1).slice(0,8).map(el=>({tag:el.tagName,cls:el.className,right:el.getBoundingClientRect().right}))}));
 report.observations.push({label,...state});assert.ok(state.h1);assert.ok(state.scrollWidth<=state.width+1,`${label}: overflow ${state.scrollWidth}/${state.width}`);assert.deepEqual(state.broken,[]);
}
async function shot(name){
 await page.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=700){scrollTo(0,y);await new Promise(r=>setTimeout(r,20));}await document.fonts.ready;scrollTo(0,0);});
 await page.screenshot({path:`${out}/scenes-${name}.png`,fullPage:true});
}
try {
 if(live){
  const expected=process.env.EXPECTED_COMMIT;assert.ok(expected,'EXPECTED_COMMIT is required for public verification');
  for(let i=0;i<24;i++){try{const build=await(await get(`/build.json?check=${expected}`)).json();if(build.commit===expected){report.build=build;break;}}catch{/* CDN propagation only */}await delay(5000);}
  assert.equal(report.build?.commit,expected);assert.equal(report.build?.version,version);
 } else {for(let i=0;i<80;i++){try{if((await fetch(url('/'))).ok)break;}catch{/* Server startup */}await delay(100);}}
 const versionJson=await(await get('/version.json')).json();assert.equal(versionJson.version,version);assert.equal(versionJson.paymentActivated,false);
 browser=await chromium.launch({headless:true,args:['--no-sandbox'],...(process.env.BROWSER_EXECUTABLE_PATH?{executablePath:process.env.BROWSER_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});page=await context.newPage();
 page.on('pageerror',error=>report.errors.push(error.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(`${m.text()} ${m.location().url}`);});
 await visit('/?lang=tr');await page.locator('.ed-featured').waitFor();
 for(const id of ['DT117','DT101','DT157','DT002']){
  const media=page.locator(`.ed-featured [data-media-for=${id}]`);await media.scrollIntoViewIfNeeded();await media.locator('img').evaluate(el=>el.decode());
  assert.equal(await media.getAttribute('data-scene-id'),scenes.find(s=>s.primaryFor.includes(id)).id);
 }
 await page.locator('.ed-featured').screenshot({path:`${out}/scenes-featured.png`});await shot('home-tr');await inspect('home-tr-1440');
 await visit('/kompozisyonlar?lang=tr');assert.equal(await page.locator('[data-composition-id]').count(),12);
 await page.locator('.ed-more button').click();assert.equal(await page.locator('[data-composition-id]').count(),24);
 await page.locator('.ed-more button').click();assert.equal(await page.locator('[data-composition-id]').count(),30);
 for(const scene of scenes){
  const card=page.locator(`[data-composition-id="${scene.id}"]`);const img=card.locator('img');await img.scrollIntoViewIfNeeded();await img.evaluate(el=>el.decode());
  const src=await img.evaluate(el=>el.currentSrc);assert.ok(scene.variants.some(v=>src.endsWith(v.src)),`${scene.id}: incorrect image`);report.renderedScenes.push({id:scene.id,src});
 }
 await inspect('gallery-all-30-1440');await shot('gallery-all');report.checks.push('All thirty unique scenes render and select a registered responsive variant');
 const opener=page.locator('[data-composition-id="R3-09"] .scene-open');await opener.click();await page.locator('dialog[open]').waitFor();
 assert.ok(await page.locator('dialog button').evaluate(el=>el===document.activeElement));await page.keyboard.press('Escape');
 assert.equal(await page.locator('dialog[open]').count(),0);assert.ok(await opener.evaluate(el=>el===document.activeElement));
 await page.locator('.ed-gallery-filter button').last().click();assert.equal(await page.locator('[data-composition-id]').count(),1);
 assert.equal(await page.locator('[data-composition-id]').getAttribute('data-composition-id'),'R3-09');report.checks.push('Gallery pagination, filtering, modal Escape and focus restoration');
 const primaryIds=[...new Set(scenes.flatMap(s=>s.primaryFor))];
 for(const id of primaryIds){
  await visit(`/shop?lang=tr&q=${id}`);const card=page.locator(`[data-product-id="${id}"]`);assert.equal(await card.count(),1);
  const scene=scenes.find(s=>s.primaryFor.includes(id));assert.equal(await card.locator('[data-media-for]').getAttribute('data-scene-id'),scene.id);
  await card.locator('a').click();await page.locator('.v3-pdp-media').waitFor();await page.locator('.v3-pdp-media img').evaluate(el=>el.decode());
  assert.equal(await page.locator('.v3-pdp-media').getAttribute('data-scene-id'),scene.id);
  const deep=await fetch(page.url(),{cache:'no-store'});assert.equal(deep.status,200,`Product deep link ${id}`);
  const expected=scenes.filter(s=>s.sourceIds.includes(id));
  if(expected.length>1){
   const thumbs=page.locator('.scene-thumbnails button');assert.equal(await thumbs.count(),expected.length);
   for(let i=0;i<expected.length;i++){await thumbs.nth(i).click();await page.locator('.v3-pdp-media img').evaluate(el=>el.decode());assert.equal(await thumbs.nth(i).getAttribute('aria-pressed'),'true');}
  }
  if(id==='DT001'||id==='DT021')await shot(`product-${id}`);
  await inspect(`product-${id}-1440`);
 }
 report.checks.push(`${primaryIds.length} explicit product mappings and every alternative thumbnail work`);
 await visit('/shop?lang=tr&q=DT131');assert.equal(await page.locator('[data-media-for=DT131]').getAttribute('data-scene-id'),'R1-09');
 for(const id of ['DT049','DT130','DT164','DT159','DT099']){await visit(`/shop?lang=tr&q=${id}`);assert.equal(await page.locator(`[data-media-for=${id}]`).getAttribute('data-media-kind'),'pending');}
 report.checks.push('Unconfirmed rose water, natural apricots, salt, date cultivar and branded molasses do not receive misleading images');
 await visit('/shop?lang=tr&q=DT001');await page.locator('[data-product-id=DT001] a').click();await page.locator('.dt-pdp__actions>button').click();
 await page.locator('.dt-cart-link').click();await page.locator('.dt-cart-line').waitFor();
 assert.equal(await page.locator('.dt-cart-line [data-media-for=DT001]').getAttribute('data-scene-id'),'R3-03');report.checks.push('Saved selection retains the primary composition, not the last previewed alternative');
 await visit('/paket?lang=tr');assert.equal(await page.locator('.ed-page-header [data-scene-id=R3-09]').count(),1);await shot('gift');
 for(const [category,id] of [['spice','R3-10'],['nuts','R3-07'],['flour','R3-08']]){await visit(`/shop/${category}?lang=tr`);assert.equal(await page.locator(`.scene-category-header [data-scene-id=${id}]`).count(),1);await inspect(`category-${category}-1440`);}
 for(const locale of Object.keys(copy)){
  await page.setViewportSize({width:320,height:900});
  for(const path of ['/kompozisyonlar','/paket','/shop/spice']){await visit(`${path}?lang=${locale}`);await inspect(`${path}-${locale}-320`);assert.equal(await page.locator('html').getAttribute('lang'),locale==='no'?'nb':locale);}
  if(['tr','el','en'].includes(locale)){await visit(`/kompozisyonlar?lang=${locale}`);await shot(`gallery-${locale}-mobile`);}
 }
 for(const scene of scenes)for(const variant of scene.variants){
  const response=await get(variant.src);assert.match(response.headers.get('content-type'),/image\/webp/);
  const bytes=Buffer.from(await response.arrayBuffer());assert.equal(bytes.length,variant.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),variant.sha256);
  report.verifiedFiles.push(variant.src);
 }
 assert.equal(report.verifiedFiles.length,120);assert.deepEqual(report.errors,[]);report.ok=true;
 console.log(`Three-round integration passed. ${report.renderedScenes.length} scenes, ${report.verifiedFiles.length} verified WebP files, ${report.observations.length} layouts.`);
} catch(error){report.failure=String(error);console.error(error);process.exitCode=1;await page?.screenshot({path:`${out}/scenes-failure.png`,fullPage:true}).catch(()=>{});}
finally{writeFileSync(`${out}/three-rounds-browser.json`,JSON.stringify(report,null,2));await browser?.close();server?.kill();}
