import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync,readFileSync,mkdtempSync,writeFileSync,mkdirSync,rmSync } from 'node:fs';
import { join,resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
const root=resolve(import.meta.dirname,'..');
const url=new URL('./static-route-shells.mjs',import.meta.url);
const routes=existsSync(url)?await import(url):{};
const address=new URL('../src/lib/catalog-address.ts',import.meta.url);
const names=existsSync(address)?await import(address):{};
const raw=JSON.parse(readFileSync(join(root,'src/data/catalog-vitrin.json'),'utf8'));

test('known catalogue and editorial URLs receive real static document entry points',()=>{
 assert.equal(typeof routes.catalogueRoutePaths,'function');
 const paths=routes.catalogueRoutePaths(root);
 for(const path of ['/shop','/kompozisyonlar','/paket','/shop/spice','/shop/salt','/odeme/iptal','/notlar/etiketin-anlattiklari','/p/elma-sirkesi','/p/kiraz-ve-visneli-lokum'])assert.ok(paths.includes(path),path);
 assert.equal(paths.filter(p=>p.startsWith('/p/')).length,226);
 assert.equal(new Set(paths).size,paths.length);
});
test('static URLs never publish held products or parameter templates',()=>{
 assert.equal(typeof routes.catalogueRoutePaths,'function');
 const paths=routes.catalogueRoutePaths(root);
 assert.ok(!paths.some(p=>p.includes('$')||p.includes('..')));
 const held=raw.filter(r=>r.editorial_status==='İNCELEME ÖNCESİ YAYIN YOK');
 const slugs=names.sourceProductSlugs(raw);
 for(const record of held)assert.ok(!paths.includes('/p/'+slugs[raw.indexOf(record)]));
});
test('shared product addresses preserve every existing catalogue URL',()=>{
 assert.equal(typeof names.sourceProductSlugs,'function');
 const slugs=names.sourceProductSlugs(raw);
 assert.equal(slugs.length,271);assert.equal(new Set(slugs).size,271);
 assert.equal(createHash('sha256').update(JSON.stringify(slugs)).digest('hex'),'bd9f81beacf1d20dbc07540f911b5ca3b0b87d97cab7f600ffeba6eb82b8c7f3');
});
test('route emitter writes all known shells and leaves unrelated files intact',()=>{
 assert.equal(typeof routes.writeRouteShells,'function');
 const out=mkdtempSync(join(tmpdir(),'detoks-routes-'));
 try{mkdirSync(join(out,'assets'));writeFileSync(join(out,'assets','keep.js'),'keep');
 routes.writeRouteShells(out,'<html>shell</html>',['/shop','/shop/spice','/kompozisyonlar']);
 for(const path of ['shop/index.html','shop/spice/index.html','kompozisyonlar/index.html'])assert.equal(readFileSync(join(out,path),'utf8'),'<html>shell</html>');
 assert.equal(readFileSync(join(out,'assets/keep.js'),'utf8'),'keep');
 assert.equal(existsSync(join(out,'does-not-exist/index.html')),false);
 }finally{rmSync(out,{recursive:true,force:true});}
});
test('route emitter rejects traversal, external paths and asset-file collisions',()=>{
 assert.equal(typeof routes.writeRouteShells,'function');
 const out=mkdtempSync(join(tmpdir(),'detoks-route-guard-'));
 try{for(const path of ['/../secret','//evil.com','https://example.test','/assets/main.js','/shop?lang=tr'])assert.throws(()=>routes.writeRouteShells(out,'shell',[path]));}
 finally{rmSync(out,{recursive:true,force:true});}
});
