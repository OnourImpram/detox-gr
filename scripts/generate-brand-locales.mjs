/** Build one independently loadable editorial pack per locale from the master. */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const source = JSON.parse(readFileSync(resolve(root, 'src/data/brand-copy.json'), 'utf8'));
const target = resolve(root, 'src/data/brand');
mkdirSync(target, { recursive: true });
for (const [locale, pack] of Object.entries(source)) {
  if (!/^[a-z]{2}$/.test(locale)) throw new Error('Invalid locale filename');
  writeFileSync(resolve(target, `${locale}.json`), `${JSON.stringify(pack, null, 2)}\n`);
}
console.log(`Prepared ${Object.keys(source).length} independent editorial packs.`);
