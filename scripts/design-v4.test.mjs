import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const read=p=>existsSync(resolve(root,p))?readFileSync(resolve(root,p),'utf8'):'';
const palette=()=>JSON.parse(read('src/data/design-v4.json')||'{}');
const lum=hex=>{const c=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];};
const contrast=(a,b)=>{const [h,l]=[lum(a),lum(b)].sort((x,y)=>y-x);return(h+.05)/(l+.05);};
test('botanical design tokens provide readable semantic color pairs',()=>{
 const d=palette();assert.equal(d.name,'botanical-editorial');
 for(const surface of ['paper','surface','white'])for(const text of ['ink','body','secondary'])assert.ok(contrast(d.colors[surface],d.colors[text])>=4.5,`${text} on ${surface}`);
 assert.ok(contrast(d.colors.ink,d.colors.paper)>=4.5);
});
test('display typography is self-hosted and supports a distinct serif role',()=>{
 const css=read('src/styles/atelier.css');assert.match(css,/font-family:\s*["']Literata/);
 assert.match(css,/font-display:\s*swap/);assert.doesNotMatch(css,/fonts\.googleapis|fonts\.gstatic/);
 assert.match(css,/prefers-reduced-motion/);
 assert.match(read('src/routes/__root.tsx'),/atelierCss/);
});
test('hero uses a real archive photograph selector without automatic rotation',()=>{
 const code=read('src/components/atelier-hero.tsx');
 assert.match(code,/ArchivePhoto/);assert.match(code,/aria-pressed/);assert.match(code,/useState/);
 assert.doesNotMatch(code,/setInterval|setTimeout|autoPlay|Math\.random/);
});
test('commerce, catalogue and media source data are preserved by visual redesign',()=>{
 const manifest=JSON.parse(read('docs/design/PRESERVED.json')||'{}');assert.ok(Object.keys(manifest).length>10);
 for(const [path,hash] of Object.entries(manifest))assert.equal(createHash('sha256').update(readFileSync(resolve(root,path))).digest('hex'),hash,path);
});
test('the visual contract does not reclassify generated pictures as verified product images',()=>{
 const rootCss=read('src/styles/atelier.css');assert.doesNotMatch(rootCss,/figcaption\s*\{\s*display\s*:\s*none/);
 assert.equal(JSON.parse(read('src/data/commerce-config.json')).mode,'preview');
});
