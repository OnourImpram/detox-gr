import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';
import assert from 'node:assert/strict';
const root='http://127.0.0.1:8092',base=`${root}/detox-gr`,out='qa-evidence';
const copy=JSON.parse(readFileSync('src/data/brand-copy.json','utf8'));
const photos=JSON.parse(readFileSync('src/data/photo-archive.json','utf8')).photos;
const matrix=[
 ['/', 'hero.title'],['/hikaye','story.title'],['/raf','archive.title'],['/notlar','journal.title'],
 ['/notlar/etiketin-anlattiklari','note1.title'],['/notlar/dusunulmus-bir-hediye','note2.title'],['/notlar/gumulcinede-bir-dukkan','note3.title'],
 ['/iletisim','contact.title'],['/paket','gift.title'],['/ticari','trade.title'],['/teslimat','delivery.title'],['/yasal','legal.title'],
];
mkdirSync(out,{recursive:true});
const server=spawn(process.execPath,['scripts/serve-storefront-preview.mjs'],{stdio:'ignore'});
let browser,page;
const errors=[],observations=[];
async function check(path,key,locale,width){
 await page.setViewportSize({width,height:900});
 await page.goto(`${base}${path}?lang=${locale}`,{waitUntil:'networkidle'});
 assert.equal(await page.locator('h1').count(),1,`${path}: one heading`);
 assert.equal(await page.locator('h1').innerText(),copy[locale][key]);
 assert.equal(await page.locator('html').getAttribute('lang'),locale==='no'?'nb':locale);
 const data=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
  broken:[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.src),
  overflow:[...document.body.querySelectorAll('*')].map(e=>({tag:e.tagName,cls:typeof e.className==='string'?e.className:'',right:e.getBoundingClientRect().right,text:e.textContent?.slice(0,80)})).filter(e=>e.right>innerWidth+1).slice(0,10),
  unresolved:/\[(TAHA|DANIŞMAN)|Lorem ipsum/.test(document.querySelector('main').innerText)
 }));
 observations.push({path,locale,...data});
 assert.ok(data.scrollWidth<=width+1,`${locale}${path}: ${data.scrollWidth}/${width}`);
 assert.equal(data.broken.length,0,JSON.stringify(data.broken));
 assert.equal(data.unresolved,false,`${locale}${path}: draft marker`);
}
async function screenshot(name){
 await page.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=750){scrollTo(0,y);await new Promise(r=>setTimeout(r,30));}scrollTo(0,0);await document.fonts.ready;});
 await page.waitForTimeout(100);
 await page.screenshot({path:`${out}/${name}.png`,fullPage:true});
 await page.screenshot({path:`${out}/${name}-fold.png`});
}
try{
 for(let i=0;i<80;i++){try{if((await fetch(base+'/')).ok)break;}catch{/* Wait for the controlled test server to start. */}await delay(100);}
 browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE_PATH?{executablePath:process.env.BROWSER_EXECUTABLE_PATH}:{}),args:['--no-sandbox']});
 const context=await browser.newContext({reducedMotion:'reduce'});page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.route('**/*',r=>{const u=r.request().url();if(u.startsWith(root)||u.startsWith('data:'))return r.continue();errors.push(`Unwanted external request: ${u}`);return r.abort();});
 for(const locale of Object.keys(copy))for(const [path,key] of matrix)await check(path,key,locale,320);
 for(const locale of ['tr','el','en'])for(const [path,key] of matrix){
  await check(path,key,locale,1440);
  if(locale==='tr'&&['/','/hikaye','/raf','/paket','/notlar','/iletisim'].includes(path))await screenshot(`editorial-${path==='/'?'home':path.slice(1)}-desktop`);
 }
 await check('/','hero.title','el',390);await screenshot('editorial-home-el-mobile');
 await check('/raf','archive.title','tr',390);
 assert.equal(await page.locator('[data-photo-id]').count(),24);
 await page.locator('.ed-more button').click();assert.equal(await page.locator('[data-photo-id]').count(),48);
 await page.locator('[data-photo-id] > button').first().click();await page.locator('dialog[open]').waitFor();
 assert.ok(await page.locator('.ed-dialog-close').evaluate(e=>e===document.activeElement));
 await page.keyboard.press('Escape');assert.equal(await page.locator('dialog[open]').count(),0);
 assert.ok(await page.locator('[data-photo-id] > button').first().evaluate(e=>e===document.activeElement));
 await page.locator('.ed-gallery-filter button').nth(2).click();assert.ok(await page.locator('[data-photo-id]').count()<=24);
 await screenshot('editorial-archive-mobile');
 await check('/paket','gift.title','tr',390);
 await page.locator('.ed-inquiry select').selectOption('DE');
 await page.locator('.ed-concepts input').nth(1).check();
 await page.locator('.ed-inquiry input:not([type=radio])').fill('60 EUR');
 await page.locator('.ed-inquiry > label textarea').fill('PRIVATE_QA_GIFT_NOTE');
 const link=await page.locator('[data-testid=inquiry-link]').getAttribute('href');
 const message=new URL(link).searchParams.get('text');assert.ok(message.includes('DE')&&message.includes('60 EUR')&&message.includes(copy.tr['gift.two'])&&message.includes('PRIVATE_QA_GIFT_NOTE'));
 assert.equal(new URL(link).hostname,'wa.me');
 const saved=await page.evaluate(()=>JSON.stringify(localStorage));assert.ok(!saved.includes('PRIVATE_QA_GIFT_NOTE'));
 await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('.ed-inquiry > label textarea').inputValue(),'');
 await check('/yasal','legal.title','tr',390);
 await page.locator('.ed-legal button').click();assert.equal(await page.evaluate(()=>localStorage.getItem('detoks-gr-shop-v4')),null);
 assert.ok(await page.getByText(copy.tr['legal.cleared'],{exact:true}).isVisible());
 // Every emitted responsive asset must be present, not just images in the first viewport.
 for(let start=0;start<photos.length;start+=12)await Promise.all(photos.slice(start,start+12).flatMap(photo=>photo.variants).map(async variant=>{
  const response=await page.request.get(base+variant.src);assert.equal(response.status(),200,variant.src);assert.equal((await response.body()).length,variant.bytes,variant.src);
 }));
 assert.equal(errors.length,0,errors.slice(0,8).join('\n'));
 writeFileSync(`${out}/editorial-browser.json`,JSON.stringify({ok:true,observations,errors,assetsChecked:photos.length*3,interactive:['gallery-pagination','dialog-focus-escape','gallery-filter','inquiry-payload','no-note-persistence','local-data-deletion']},null,2));
 console.log(`Editorial browser verified ${observations.length} page/locale/viewport combinations and ${photos.length*3} assets.`);
}catch(error){await page?.screenshot({path:`${out}/editorial-failure.png`,fullPage:true}).catch(()=>undefined);writeFileSync(`${out}/editorial-browser.json`,JSON.stringify({ok:false,error:String(error),observations,errors},null,2));console.error(error);process.exitCode=1;}
finally{await browser?.close();server.kill();}
