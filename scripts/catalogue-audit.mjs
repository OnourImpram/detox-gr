import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const read = file => JSON.parse(readFileSync(resolve(file), 'utf8'));
const rows = read('src/data/catalog-vitrin.json');
const info = read('src/data/urun-bilgi.json');
const config = read('src/data/commerce-config.json');
const held = rows.filter(row => row.editorial_status === 'İNCELEME ÖNCESİ YAYIN YOK');
const visible = rows.filter(row => row.editorial_status !== 'İNCELEME ÖNCESİ YAYIN YOK');
const verified = Object.entries(info).filter(([key, value]) => /^DT\d+$/.test(key) && value && typeof value === 'object');
const sourceIds = new Set(rows.map(row => row.source_record_id));
const invalid = [];
if (sourceIds.size !== rows.length) invalid.push('Duplicate product source identifiers');
for (const [id, value] of verified) {
  if (!sourceIds.has(id)) invalid.push(`Unknown source identifier: ${id}`);
  if (value.saleApproved && value.labelReviewed !== true) invalid.push(`${id}: sale approved before label review`);
  if (value.saleApproved && (!Number.isInteger(value.stock) || value.stock < 0)) invalid.push(`${id}: stock unverified`);
  if (value.saleApproved && value.vatIncluded !== true) invalid.push(`${id}: VAT status unverified`);
}
const report = {
  mode: config.mode,
  records: rows.length,
  previewProducts: visible.length,
  heldProducts: held.length,
  sourcePublished: rows.filter(row => row.publish === true).length,
  approvedProductRecords: verified.length,
  saleApproved: verified.filter(([,value]) => value.saleApproved === true).length,
  verifiedImages: verified.filter(([,value]) => Boolean(value.image)).length,
  sourcePriceMissing: rows.filter(row => row.source_price == null || String(row.source_price).trim() === '').map(row => row.source_record_id),
  enabledDestinations: config.enabledCountries,
  intendedMarketScope: '27 EU member states and Norway. Target only, not confirmed delivery coverage.',
  invalid,
};
console.log(JSON.stringify(report, null, 2));
if (invalid.length) process.exitCode = 1;
