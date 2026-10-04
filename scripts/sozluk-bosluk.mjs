// Sözlük boşluğu ölçüsü: vitrindeki ürün adlarından EN çevirisinde Türkçeye özgü harf (ğ ş ı İ) kalanları listeler.
// Kullanım: node --experimental-strip-types scripts/sozluk-bosluk.mjs [çıktı.json]
// Çıktı: {"adlar": [...], "sayi": n, "toplam": m} — Flash'a 19 dil sözlük satırı üretmesi için girdi.
import { readFileSync, writeFileSync } from "node:fs";
import { translatePhrase } from "../src/lib/i18n-glossary.ts";

const raw = JSON.parse(readFileSync(new URL("../src/data/catalog-normalized.json", import.meta.url), "utf8"));
const rows = Array.isArray(raw) ? raw : Object.values(raw).find(Array.isArray);
const HELD = "İNCELEME ÖNCESİ YAYIN YOK";

// catalog.ts ile aynı ad türetimi (NAME_OVERRIDE hariç): editorial_title_candidate → source_name; marka soneki temizliği
function stripHouseSuffix(name) {
  return name
    .replace(/\(\s*DETOKS AKTAR(?:\s+özel yapım)?\s*,?\s*/gi, "(")
    .replace(/\(\s*\)/g, "")
    .replace(/\s*DETOKS AKTAR(?:\s+özel yapım)?/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+,/g, ",")
    .trim();
}
const looksTurkish = (s) => /[ğşıİ]/.test(s);

const adlar = [];
for (const r of rows) {
  if (r.editorial_status === HELD) continue;
  const base = (r.editorial_title_candidate || r.source_name || "").trim();
  const name = stripHouseSuffix(base);
  const en = translatePhrase(name, "en");
  if (looksTurkish(en)) adlar.push({ id: r.source_record_id, tr: name, en_simdiki: en });
}
const out = { sayi: adlar.length, toplam: rows.filter((r) => r.editorial_status !== HELD).length, adlar };
console.log(`EN çevirisinde Türkçe kalan ad: ${out.sayi} / ${out.toplam}`);
for (const a of adlar.slice(0, 12)) console.log(" ", a.tr, "→", a.en_simdiki);
if (process.argv[2]) writeFileSync(process.argv[2], JSON.stringify(out, null, 1), "utf8");
