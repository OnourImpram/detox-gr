import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';
const live = Boolean(process.env.SITE_URL);
const base = (process.env.SITE_URL ?? 'http://127.0.0.1:8099/detox-gr').replace(/\/$/,'');
const out = live ? 'qa-live' : 'qa-evidence';
mkdirSync(out,{recursive:true});
const release = JSON.parse(readFileSync('src/data/release.json','utf8'));
const report = { ok:false, live, base, version:release.version, observations:[], checks:[], errors:[] };
const server = live ? null : spawn(process.execPath,['scripts/serve-storefront-preview.mjs'],{env:{...process.env,QA_PORT:'8099'},stdio:'ignore'});
let browser, page;
async function visit(path) {
 const res = await page.goto(`${base}${path}`,{waitUntil:'networkidle'});
 assert.equal(res?.status(),200,`Document ${path}`);
 await page.locator('main h1').waitFor();
 await page.waitForFunction(()=>document.querySelector('main')?.getAttribute('aria-busy')==='false');
}
async function inspect(label) {
 const state = await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,title:document.title,lang:document.documentElement.lang,h1:document.querySelector('main h1')?.textContent,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth&&i.getBoundingClientRect().width>0).map(i=>i.currentSrc),overflow:[...document.querySelectorAll('main *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).slice(0,8).map(e=>({tag:e.tagName,class:e.className,right:e.getBoundingClientRect().right})),og:document.querySelector('meta[property="og:image"]')?.content}));
 report.observations.push({label,...state});
 assert.ok(state.h1,`${label}: missing main heading`);
 assert.ok(state.scrollWidth<=state.width+1,`${label}: horizontal overflow ${state.scrollWidth}/${state.width}`);
 assert.deepEqual(state.broken,[],`${label}: broken image`);
}
async function shot(name,fullPage=true) {
 if(fullPage)await page.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=700){scrollTo(0,y);await new Promise(r=>setTimeout(r,20));}await document.fonts.ready;scrollTo(0,0);});
 await page.screenshot({path:`${out}/refinement-${name}.png`,fullPage});
}
async function record(name,fn){await fn();report.checks.push(name);}
try {
 if(!live) {for(let i=0;i<80;i++){try{if((await fetch(base+'/')).ok)break;}catch{/* Server startup. */}await delay(100);}}
 else {
  assert.ok(process.env.EXPECTED_COMMIT,'Live verification needs an expected build identity');
  for(let i=0;i<24;i++){const response=await fetch(`${base}/build.json?expected=${process.env.EXPECTED_COMMIT}`,{cache:'no-store'});if(response.ok){const build=await response.json();if(build.commit===process.env.EXPECTED_COMMIT){report.build=build;break;}}await delay(5000);}
  assert.equal(report.build?.commit,process.env.EXPECTED_COMMIT);assert.equal(report.build?.version,release.version);
 }
 browser = await chromium.launch({headless:true,args:['--no-sandbox'],...(process.env.BROWSER_EXECUTABLE_PATH?{executablePath:process.env.BROWSER_EXECUTABLE_PATH}:{})});
 const context = await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 page = await context.newPage();
 page.on('pageerror',e=>report.errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')report.errors.push(`${m.text()} ${m.location().url}`);});
 // Capture core pages first so visual review is possible even if a later interaction fails.
 for(const [name,path] of [['home','/?lang=tr'],['catalogue','/shop?lang=tr'],['product','/p/elma-sirkesi/?lang=tr'],['gift','/paket/?lang=tr']]) {
  await visit(path);await inspect(`${name}-1440`);await shot(`${name}-desktop`);
  if(name==='home'){await shot('home-first-screen',false);report.home=await page.evaluate(()=>({height:document.documentElement.scrollHeight,featuredY:document.querySelector('.ed-featured')?.getBoundingClientRect().top+scrollY,duplicateArchive:document.querySelectorAll('.ed-archive-bridge').length,mainProcess:document.querySelectorAll('.ed-home .ed-process').length}));}
 }
 await record('Direct route metadata is meaningful before JavaScript',async()=>{
  const product=await(await fetch(`${base}/p/elma-sirkesi/`)).text();
  const story=await(await fetch(`${base}/hikaye/`)).text();
  assert.match(product,/<title>Elma sirkesi \| Detoks.gr<\/title>/);
  assert.match(product,/<meta property="og:image" content="https:\/\//);
  assert.ok(!product.includes('/detox-gr/detox-gr/'));
  assert.notEqual(product.match(/<title>(.*?)<\/title>/)?.[1],story.match(/<title>(.*?)<\/title>/)?.[1]);
  assert.match(product,/name="robots" content="noindex,nofollow"/);
 });
 await record('Typing multiple words retains spaces, URL state and exact title ranking',async()=>{
  await visit('/shop?lang=tr');const input=page.locator('.dt-explorer__search input');
  await input.pressSequentially('elma sirkesi',{delay:40});await page.waitForTimeout(150);
  assert.equal(await input.inputValue(),'elma sirkesi');assert.equal(new URL(page.url()).searchParams.get('q'),'elma sirkesi');
  assert.equal(await page.locator('main h1').innerText(),'Arama sonuçları');
  assert.equal(await page.locator('[data-product-id]').first().getAttribute('data-product-id'),'DT117');
  await input.fill('çörek otu yağı');await page.waitForTimeout(120);assert.equal(await page.locator('[data-product-id]').first().getAttribute('data-product-id'),'DT182');
 });
 await record('Explicit typo suggestions preserve customer choice',async()=>{
  await visit('/shop?lang=tr&q=sirkesx');assert.ok(await page.locator('.customer-suggestions button').count());
  assert.equal(new URL(page.url()).searchParams.get('q'),'sirkesx');await page.locator('.customer-suggestions button').first().click();await page.waitForTimeout(150);assert.ok(await page.locator('[data-product-id]').count());
 });
 await record('View, picture filter, language and browser back preserve discovery context',async()=>{
  await visit('/shop?lang=tr');await page.locator('.customer-pictured input').check();await page.getByRole('button',{name:'Liste',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('[data-testid="product-grid"]')?.getAttribute('data-view')==='list');
  assert.equal(await page.locator('[data-product-id] [data-media-kind="pending"]').count(),0);
  await shot('catalogue-list-desktop');
  await page.locator('.dt-language-select').selectOption('el');await page.waitForFunction(()=>document.documentElement.lang==='el');
  assert.equal(new URL(page.url()).searchParams.get('view'),'list');assert.equal(new URL(page.url()).searchParams.get('media'),'pictured');
  await page.locator('.dt-language-select').selectOption('tr');await page.waitForFunction(()=>document.documentElement.lang==='tr');
  await page.locator('[data-product-id="DT117"] a').click();await page.locator('.v3-pdp-media').waitFor();await page.goBack({waitUntil:'networkidle'});
  assert.equal(await page.locator('[data-testid="product-grid"]').getAttribute('data-view'),'list');assert.ok(await page.locator('.customer-pictured input').isChecked());
 });
 await record('Quick add produces a real request list with kilogram-aware quantities',async()=>{
  await visit('/shop?lang=tr&q=DT002');await page.locator('[data-product-id="DT002"] [data-testid="quick-add"]').click();
  assert.equal(await page.locator('.customer-list-count').innerText(),'1');
  await visit('/sepet?lang=tr');await page.locator('.dt-cart-line input[type="number"]').fill('2');
  const href=await page.locator('[data-testid="selection-inquiry"]').getAttribute('href');
  const text=new URL(href).searchParams.get('text');assert.match(text,/2 kg · Gül lokumu \(DT002\)/i);assert.ok(text.includes('https://onourimpram.github.io/detox-gr/shop?lang=tr'));
  assert.ok((await page.locator('.dt-cart-line__total').innerText()).includes('31,80'));
  await page.locator('.dt-note-label textarea').fill('PRIVATE_BROWSER_NOTE');
  assert.ok(!(await page.evaluate(()=>localStorage.getItem('detoks-gr-shop-v4'))).includes('PRIVATE_BROWSER_NOTE'));
  await shot('list-desktop');
 });
 await record('Clipboard denial opens a selectable request, phone remains usable',async()=>{
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('Denied for fallback test');}}}));
  await page.getByTestId('copy-message').click();await page.locator('.customer-message details[open] textarea').waitFor();
  const selected=await page.locator('.customer-message details textarea').evaluate(el=>({focus:el===document.activeElement,start:el.selectionStart,end:el.selectionEnd,text:el.value}));
  assert.equal(selected.focus,true);assert.equal(selected.start,0);assert.equal(selected.end,selected.text.length);assert.match(selected.text,/DT002/);
  assert.equal(await page.locator('.customer-message__phone').getAttribute('href'),'tel:+306945827275');
  await page.setViewportSize({width:390,height:844});await inspect('copy-fallback-list-mobile');await shot('list-mobile');
 });
 await record('Removing a list line is reversible without storing private notes',async()=>{
  await page.locator('.dt-cart-line__controls button').click();assert.equal(await page.locator('.dt-cart-line').count(),0);
  await page.getByRole('button',{name:'Geri al',exact:true}).click();assert.equal(await page.locator('.dt-cart-line').count(),1);
  assert.equal(await page.locator('.dt-cart-line input[type=number]').inputValue(),'2');
 });
 await record('The product image opens in a keyboard-operable detail view',async()=>{
  await visit('/p/kiraz-ve-visneli-lokum/?lang=tr');const open=page.locator('.customer-zoom-button');await open.click();
  await page.locator('.customer-zoom[open]').waitFor();const count=await page.locator('.scene-thumbnails button').count();
  assert.ok(count>1);await page.keyboard.press('ArrowRight');assert.equal(await page.locator('.customer-zoom-controls > span').innerText(),`2 / ${count}`);
  await shot('product-zoom-mobile',false);await page.keyboard.press('Escape');assert.equal(await page.locator('.customer-zoom[open]').count(),0);assert.ok(await open.evaluate(el=>el===document.activeElement));
  await page.locator('.customer-product-help > summary').click();const msg=new URL(await page.locator('.customer-product-help [data-testid="inquiry-link"]').getAttribute('href')).searchParams.get('text');assert.match(msg,/DT001/);assert.match(msg,/Fotoğraf/);
 });
 await record('Mobile menu traps focus, closes on Escape, and has no background scrolling',async()=>{
  await visit('/?lang=tr');await page.locator('.dt-menu-button').click();await page.locator('#mobile-nav[open]').waitFor();
  assert.ok(await page.locator('#mobile-search').evaluate(el=>el===document.activeElement));
  for(let i=0;i<18;i++){await page.keyboard.press('Tab');assert.ok(await page.evaluate(()=>document.querySelector('#mobile-nav').contains(document.activeElement)));}
  assert.equal(await page.evaluate(()=>document.body.style.overflow),'hidden');await shot('menu-mobile',false);
  await page.keyboard.press('Escape');assert.equal(await page.locator('#mobile-nav[open]').count(),0);assert.ok(await page.locator('.dt-menu-button').evaluate(el=>el===document.activeElement));assert.notEqual(await page.evaluate(()=>document.body.style.overflow),'hidden');
  await page.locator('.dt-menu-button').click();await page.setViewportSize({width:1440,height:1000});await page.waitForTimeout(150);assert.equal(await page.locator('#mobile-nav[open]').count(),0);
 });
 await record('Gift requests preview the selected concept, budget and country without sending',async()=>{
  await visit('/paket?lang=tr');await page.locator('.ed-concepts input').nth(1).check();await page.locator('.ed-inquiry-fields select').selectOption('DE');await page.locator('.ed-inquiry-fields input').fill('50 EUR');await page.locator('.ed-inquiry > label textarea').fill('PRIVATE_GIFT_NOTE');
  const text=new URL(await page.getByTestId('inquiry-link').getAttribute('href')).searchParams.get('text');assert.match(text,/Mutfaktan bir seçki/);assert.match(text,/50 EUR/);assert.match(text,/DE/);assert.match(text,/PRIVATE_GIFT_NOTE/);
  assert.ok(!(await page.evaluate(()=>localStorage.getItem('detoks-gr-shop-v4'))).includes('PRIVATE_GIFT_NOTE'));
  // Clipboard success with actual browser permissions is separately exercised below.
  await context.grantPermissions(['clipboard-read','clipboard-write']);await page.getByTestId('copy-message').click();await page.waitForTimeout(100);
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),text);
 });
 for(const locale of ['tr','el','en','de','fi'])for(const width of [320,768,1440]){
  await page.setViewportSize({width,height:900});await visit(`/?lang=${locale}`);await inspect(`home-${locale}-${width}`);
  if(['tr','el','en'].includes(locale)&&width===320)await shot(`home-${locale}-mobile`);
  await visit(`/shop?lang=${locale}&view=list&media=pictured`);await inspect(`list-${locale}-${width}`);
 }
 assert.deepEqual(report.errors,[],'Unexpected JavaScript, hydration or resource errors');report.ok=true;
 console.log(`Customer journeys passed: ${report.checks.length} scenarios, ${report.observations.length} visual observations.`);
} catch(error) {
 report.failure=String(error);console.error(error);process.exitCode=1;await page?.screenshot({path:`${out}/refinement-failure.png`,fullPage:true}).catch(()=>undefined);
} finally {
 writeFileSync(`${out}/refinement-browser.json`,JSON.stringify(report,null,2));await browser?.close();server?.kill();
}
