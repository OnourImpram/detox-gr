import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const read = file => JSON.parse(readFileSync(join(root, file), 'utf8'));
const digest = file => createHash('sha256').update(readFileSync(join(root, file))).digest('hex');
const release = read('src/data/release.json');
const source = read('src/data/catalog-vitrin.json');
const archive = read('src/data/photo-archive.json').photos;
const preserved = read('docs/v3/ARCHIVE_CHECKSUMS.json');
const media = read('src/data/product-media-v3.json');
const retired = read('docs/v3/RETIRED_MEDIA.json').retired;
const references = read('src/data/product-photo-references.json');
const failures = [];
for (const [path, hash] of Object.entries(preserved)) if (!existsSync(join(root,path)) || digest(path) !== hash) failures.push(`Archive changed: ${path}`);
for (const row of retired) if (existsSync(join(root,row.path))) failures.push(`Retired media still present: ${row.path}`);
for (const asset of Object.values(media.products)) for (const variant of asset.variants) {
  const file = `public${variant.src}`;
  if (!existsSync(join(root,file)) || digest(file) !== variant.sha256) failures.push(`Invalid image bytes: ${variant.src}`);
}
for (const [id, record] of Object.entries(references)) {
  if (id !== record.sourceId || !source.some(row => row.source_record_id === id) || !archive.some(photo => photo.id === record.assetId)) failures.push(`Invalid archive reference: ${id}`);
}
if (JSON.stringify(release) !== JSON.stringify(read('public/version.json'))) failures.push('Public version mismatch');
if (read('src/data/commerce-config.json').mode !== 'preview') failures.push('Release unexpectedly activates commerce');
const size = dir => readdirSync(dir,{withFileTypes:true}).reduce((sum,item) => sum+(item.isDirectory()?size(join(dir,item.name)):statSync(join(dir,item.name)).size),0);
const scenes=read('src/data/generated-scenes.json').scenes;
for (const scene of scenes) for(const variant of scene.variants) {
 const file=`public${variant.src}`; if(!existsSync(join(root,file))||digest(file)!==variant.sha256)failures.push(`Invalid generated composition: ${variant.src}`);
}
const report = {
  addedCompositions: scenes.length,
  addedResponsiveFiles: scenes.flatMap(s=>s.variants).length,
  activeProductIllustrations: new Set(scenes.flatMap(s=>s.primaryFor)).size,
  version: release.version,
  sourceRecords: source.length,
  previewProducts: source.filter(row=>row.editorial_status!=='İNCELEME ÖNCESİ YAYIN YOK').length,
  generatedIllustrations: Object.keys(media.products).length,
  generatedResponsiveFiles: Object.values(media.products).reduce((sum,p)=>sum+p.variants.length,0),
  generatedBytes: Object.values(media.products).flatMap(p=>p.variants).reduce((sum,v)=>sum+v.bytes,0),
  archiveReferences: Object.keys(references).length,
  verifiedPhotoApprovals: Object.keys(read('src/data/photo-approved.json')).filter(key=>/^DT\d+$/.test(key)).length,
  preservedOriginalArchiveRecords: archive.length,
  preservedArchiveFiles: Object.keys(preserved).length,
  retiredFiles: retired.length,
  retiredBytes: retired.reduce((sum,row)=>sum+row.bytes,0),
  shippedPublicBytes: size(join(root,'public')),
  allChecksPassed: failures.length === 0,
  failures,
};
console.log(JSON.stringify(report,null,2));
if (failures.length) process.exitCode=1;
