import { readFileSync,readdirSync,mkdirSync,writeFileSync } from 'node:fs';
import { join,resolve,sep } from 'node:path';
import { sourceProductSlugs } from '../src/lib/catalog-address.ts';
import { CATEGORY_IDS } from '../src/lib/discovery.ts';

/** Real index.html files let known deep links return HTTP 200 on GitHub Pages. */
export function catalogueRoutePaths(projectRoot){
  const root=resolve(projectRoot);
  const read=path=>JSON.parse(readFileSync(join(root,path),'utf8'));
  const rows=read('src/data/catalog-vitrin.json');
  const info=read('src/data/urun-bilgi.json');
  const config=read('src/data/commerce-config.json');
  const paths=new Set();
  for(const name of readdirSync(join(root,'src/routes'))){
    if(!name.endsWith('.tsx'))continue;
    const source=readFileSync(join(root,'src/routes',name),'utf8');
    for(const match of source.matchAll(/createFileRoute\(["'](\/[a-z0-9/-]*)["']\)/g)){
      const path=match[1].replace(/\/$/,'');if(path)paths.add(path);
    }
  }
  for(const category of CATEGORY_IDS)paths.add(`/shop/${category}`);
  const journal=readFileSync(join(root,'src/components/editorial.tsx'),'utf8');
  for(const match of journal.matchAll(/slug:\s*['"]([a-z0-9-]+)['"]/g))paths.add(`/notlar/${match[1]}`);
  const slugs=sourceProductSlugs(rows);
  rows.forEach((row,index)=>{
    if(row.editorial_status==='İNCELEME ÖNCESİ YAYIN YOK')return;
    const product=info[row.source_record_id];
    if(config.mode==='live'&&!(row.publish===true&&product?.saleApproved===true&&product?.labelReviewed===true))return;
    paths.add(`/p/${slugs[index]}`);
  });
  return [...paths].sort();
}

export function writeRouteShells(outputRoot,html,paths){
  const root=resolve(outputRoot);
  for(const path of paths){
    if(typeof path!=='string'||!/^\/[a-z0-9-]+(?:\/[a-z0-9-]+)*$/.test(path))throw new Error(`Unsafe static route: ${path}`);
    const folder=resolve(root,`.${path}`);
    if(!folder.startsWith(root+sep))throw new Error('Static route escaped output root');
    mkdirSync(folder,{recursive:true});writeFileSync(join(folder,'index.html'),html);
  }
  return paths.length;
}
