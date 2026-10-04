/**
 * Dil paketleri üretici: tek büyük i18n yığını (i18n-generated 354 KB + sözlük 243 KB, her sayfada) yerine
 * dil başına bir modül → src/lib/i18n-gen/<locale>.ts (yalnız o dilin UI metinleri + sözlük satırları).
 * Kaynaklar değişmez: src/lib/i18n-generated.ts (Flash çevirisi), i18n-glossary.ts + i18n-glossary-ek.ts (ürün adı sözlüğü).
 * Kullanım: npm run i18n   (node --experimental-strip-types scripts/i18n-paket-uret.mts)
 * Ölçü: üretim /assets/store-*.js 780 KB → hedef < 400 KB; dil-govde.mjs EN kaçak %0 kalmalı.
 */
import { mkdirSync, writeFileSync, readdirSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { GENERATED } from "../src/lib/i18n-generated.ts";
import { GLOSSARY } from "../src/lib/i18n-glossary.ts";
import { GLOSSARY_EK } from "../src/lib/i18n-glossary-ek.ts";
import { LOCALES } from "../src/lib/i18n-locales.ts";

type Row = { src: string; map: Partial<Record<string, string>> };
const OUT = join(import.meta.dirname, "..", "src", "lib", "i18n-gen");
mkdirSync(OUT, { recursive: true });
for (const f of readdirSync(OUT)) if (f.endsWith(".ts")) unlinkSync(join(OUT, f));

// Ek satırlar (tam ürün adları) önce; sonra uzunluk sırası — en uzun eşleşme kazanır (i18n-glossary.ts'teki düzenle aynı)
const ROWS: Row[] = [...GLOSSARY_EK, ...GLOSSARY].sort((a, b) => b.src.length - a.src.length);

let ozet: string[] = [];
for (const { code } of LOCALES) {
  if (code === "tr") continue; // TR kaynak dil: UI fill(tr) tabanda, sözlük geçişsiz
  const ui: Record<string, string> = {};
  if (code !== "en") for (const [k, m] of Object.entries(GENERATED)) if (m[code]) ui[k] = m[code]!;
  // sözlük: bu dilin karşılığı, yoksa EN yedeği üretim anında gömülür (çalışma zamanında EN paketi gerekmez)
  const glossary: [string, string][] = [];
  for (const r of ROWS) {
    const v = r.map[code] ?? r.map.en;
    if (v) glossary.push([r.src, v]);
  }
  const body = JSON.stringify({ ui, glossary });
  writeFileSync(join(OUT, `${code}.ts`), `// ÜRETİLMİŞ DOSYA — scripts/i18n-paket-uret.mts; elle düzenleme yok (kaynak: i18n-generated.ts, i18n-glossary*.ts)\nimport type { Pack } from "../i18n-pack";\nconst pack: Pack = ${body};\nexport default pack;\n`, "utf-8");
  ozet.push(`${code}:${Object.keys(ui).length}/${glossary.length}/${Math.round(body.length / 1024)}KB`);
}
console.log("i18n-gen:", ozet.join("  "));
